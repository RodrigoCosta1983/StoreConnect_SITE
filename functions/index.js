const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentDeleted } = require("firebase-functions/v2/firestore");
const admin = require('firebase-admin');
const axios = require("axios");

admin.initializeApp();

const ASAAS_URL = "https://www.asaas.com/api/v3";
// Se for teste use: "https://sandbox.asaas.com/api/v3"

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Função para limpar CPF (deixa só números)
function cleanCpfCnpj(value) {
    if (!value) return "";
    return value.replace(/\D/g, '');
}

// --- 1. FUNÇÃO DE CRIAR ASSINATURA (Versão Híbrida e Inteligente) ---
exports.createAsaasSubscription = onCall({ timeoutSeconds: 120 }, async (request) => {
  console.log(">>> INICIANDO ASSINATURA (HÍBRIDA V2) <<<");

  const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 

  if (!request.auth) throw new HttpsError("unauthenticated", "Usuário não logado.");

  // 1. Prepara os dados
  const cpfCnpj = cleanCpfCnpj(request.data.cpfCnpj);
  const { name, email, phone } = request.data;
  const userId = request.auth.uid;
  
  const headers = { "access_token": ASAAS_API_KEY, "Content-Type": "application/json" };

  // 2. Monta o objeto do cliente SEM campos vazios (Isso resolve o erro 400 do telefone)
  const customerData = {
    name: name,
    email: email,
    cpfCnpj: cpfCnpj,
    externalReference: userId
  };
  // Só adiciona telefone se tiver pelo menos 10 dígitos (evita erro de string vazia)
  if (phone && phone.replace(/\D/g, '').length >= 10) {
      customerData.phone = phone;
      customerData.mobilePhone = phone;
  }

  console.log(`Processando cliente: ${name} (${cpfCnpj})`);

  try {
    // A. Busca ou Cria Cliente
    let customerId;
    
    try {
        const search = await axios.get(`${ASAAS_URL}/customers?cpfCnpj=${cpfCnpj}`, { headers });
        if (search.data.data && search.data.data.length > 0) {
            customerId = search.data.data[0].id;
            console.log(`Cliente encontrado: ${customerId}`);
        } else {
            const create = await axios.post(`${ASAAS_URL}/customers`, customerData, { headers });
            customerId = create.data.id;
            console.log(`Cliente criado: ${customerId}`);
        }
    } catch (apiError) {
        // Captura erro específico da criação do cliente (ex: email inválido, telefone ruim)
        const asaasError = apiError.response?.data?.errors?.[0]?.description || apiError.message;
        console.error("Erro ao criar/buscar cliente no Asaas:", JSON.stringify(apiError.response?.data));
        throw new HttpsError("invalid-argument", `Erro no cadastro Asaas: ${asaasError}`);
    }

    // B. Cria Assinatura (PIX)
    let subscriptionId;
    try {
        const subResponse = await axios.post(`${ASAAS_URL}/subscriptions`, {
            customer: customerId,
            billingType: "UNDEFINED", 
            value: 15.90,
            nextDueDate: new Date().toISOString().split('T')[0], // HOJE
            cycle: "MONTHLY",
            description: "Assinatura Store Connect Pro",
            externalReference: userId
        }, { headers });
        subscriptionId = subResponse.data.id;
    } catch (subError) {
        const msg = subError.response?.data?.errors?.[0]?.description || subError.message;
        console.error("Erro ao criar assinatura:", JSON.stringify(subError.response?.data));
        throw new HttpsError("invalid-argument", `Erro na assinatura: ${msg}`);
    }

    console.log(`Assinatura ${subscriptionId} criada. Buscando link...`);

    // C. BUSCA O LINK (Estratégia Híbrida)
    let finalPaymentLink = null;
    
    for (let i = 1; i <= 40; i++) {
        try {
            let foundPayment = null;

            // Tenta Assinatura
            const subSearch = await axios.get(
                `${ASAAS_URL}/payments?subscription=${subscriptionId}&limit=1`, 
                { headers }
            );
            
            if (subSearch.data.data && subSearch.data.data.length > 0) {
                foundPayment = subSearch.data.data[0];
            } 
            // Tenta Cliente (Fallback rápido)
            else {
                const custSearch = await axios.get(
                    `${ASAAS_URL}/payments?customer=${customerId}&status=PENDING&limit=1&sort=dateCreated&order=desc`, 
                    { headers }
                );
                if (custSearch.data.data && custSearch.data.data.length > 0) {
                    foundPayment = custSearch.data.data[0];
                }
            }

            if (foundPayment) {
                finalPaymentLink = foundPayment.billUrl || foundPayment.invoiceUrl;
                console.log(`✅ Link encontrado na tentativa ${i}: ${finalPaymentLink}`);
                break; 
            }
        } catch (e) {
            console.warn(`Tentativa ${i} falhou...`);
        }
        await delay(1500); 
    }

    if (!finalPaymentLink) {
        throw new HttpsError("unavailable", "O Pix foi gerado, mas o sistema demorou para capturar o link. Verifique seu email.");
    }

    return {
      success: true,
      paymentUrl: finalPaymentLink, 
      subscriptionId: subscriptionId
    };

  } catch (error) {
    console.error("Erro Fatal:", error);
    // Repassa o erro detalhado para o App Flutter
    throw new HttpsError(error.code || "internal", error.message);
  }
});

// --- 2. WEBHOOK ---
// --- 2. WEBHOOK (Versão Final: Sincronia Total) ---
exports.asaasWebhook = onRequest(async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const event = req.body.event;
    const payment = req.body.payment || {};
    const userId = payment.externalReference || req.body.subscription?.externalReference;

    console.log(`[Webhook] Evento: ${event} | User ID: ${userId}`);

    if (!userId) return res.json({ received: true }); 

    try {
        const db = admin.firestore();
        
        // 1. Busca as referências
        // Tenta achar a LOJA pelo dono
        const storeQuery = await db.collection("stores").where("ownerId", "==", userId).limit(1).get();
        const userRef = db.collection("users").doc(userId);

        let storeRef = null;
        if (!storeQuery.empty) {
            storeRef = storeQuery.docs[0].ref;
            console.log(`✅ Loja encontrada: ${storeRef.id}`);
        }

        // 2. Define o novo status
        let newStatus = null;
        if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
            newStatus = "active";
        } else if (event === "PAYMENT_OVERDUE" || event === "SUBSCRIPTION_DELETED") {
            newStatus = "inactive";
        }

        // 3. Atualiza TUDO o que encontrar (Loja e Usuário)
        if (newStatus) {
            const batch = db.batch(); // O Batch faz tudo junto, com segurança
            
            // Atualiza o Usuário
            batch.update(userRef, { 
                subscriptionStatus: newStatus,
                lastPaymentDate: admin.firestore.FieldValue.serverTimestamp()
            });

            // Atualiza a Loja (se existir)
            if (storeRef) {
                batch.update(storeRef, { 
                    subscriptionStatus: newStatus,
                    lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
                    subscriptionId: payment.subscription || null
                });
            }

            await batch.commit();
            console.log(`🚀 Status ${newStatus} aplicado para User e Loja.`);
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error("Erro Webhook:", error);
        res.status(500).send("Erro interno");
    }
});

// --- 3. Limpeza ---
exports.onProductDelete = onDocumentDeleted("stores/{storeId}/products/{productId}", async (event) => {
    const deletedData = event.data && event.data.data();
    if (!deletedData) return;
    let imageRefValue = deletedData.imagePath ?? deletedData.imageUrl ?? null;
    if (!imageRefValue) return;
    try {
        const bucket = admin.storage().bucket();
        let filePath = String(imageRefValue);
        if (filePath.startsWith('gs://')) filePath = filePath.replace(/^gs:\/\/[^\/]+\/?/, '');
        else if (filePath.startsWith('http')) {
            const m = filePath.match(/\/o\/([^?]+)/);
            if (m) filePath = decodeURIComponent(m[1]);
        }
        const file = bucket.file(filePath);
        if ((await file.exists())[0]) await file.delete();
    } catch (e) { console.error(e); }
});