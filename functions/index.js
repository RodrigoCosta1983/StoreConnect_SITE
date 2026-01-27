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

// --- 1. FUNÇÃO DE CRIAR ASSINATURA (Versão Híbrida) ---
exports.createAsaasSubscription = onCall({ timeoutSeconds: 120 }, async (request) => {
  console.log(">>> INICIANDO ASSINATURA (HÍBRIDA) <<<");

  const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 

  if (!request.auth) throw new HttpsError("unauthenticated", "Usuário não logado.");

  // Limpeza de CPF para evitar duplicidade
  const cpfCnpj = cleanCpfCnpj(request.data.cpfCnpj);
  const { name, phone, email } = request.data;
  const userId = request.auth.uid;
  
  const headers = { "access_token": ASAAS_API_KEY, "Content-Type": "application/json" };

  try {
    // A. Busca ou Cria Cliente
    let customerId;
    const search = await axios.get(`${ASAAS_URL}/customers?cpfCnpj=${cpfCnpj}`, { headers });
    
    if (search.data.data && search.data.data.length > 0) {
      customerId = search.data.data[0].id;
      console.log(`Cliente encontrado: ${customerId}`);
    } else {
      const create = await axios.post(`${ASAAS_URL}/customers`, {
        name, email, cpfCnpj, phone, externalReference: userId
      }, { headers });
      customerId = create.data.id;
      console.log(`Cliente criado: ${customerId}`);
    }

    // B. Cria Assinatura (PIX)
    const subResponse = await axios.post(`${ASAAS_URL}/subscriptions`, {
      customer: customerId,
      billingType: "UNDEFINED", 
      value: 0.90,
      nextDueDate: new Date().toISOString().split('T')[0], // HOJE
      cycle: "MONTHLY",
      description: "Assinatura Store Connect Pro",
      externalReference: userId
    }, { headers });

    const subscriptionId = subResponse.data.id;
    console.log(`Assinatura ${subscriptionId} criada. Iniciando caça ao link...`);

    // C. BUSCA O LINK (Estratégia Híbrida)
    let finalPaymentLink = null;
    
    // Tenta por 60 segundos
    for (let i = 1; i <= 40; i++) {
        try {
            let foundPayment = null;

            // TENTATIVA 1: Busca pela Assinatura (O ideal)
            const subSearch = await axios.get(
                `${ASAAS_URL}/payments?subscription=${subscriptionId}&limit=1`, 
                { headers }
            );
            
            if (subSearch.data.data && subSearch.data.data.length > 0) {
                foundPayment = subSearch.data.data[0];
            } 
            // TENTATIVA 2: Busca pelo Cliente (O salvador da pátria)
            else {
                const custSearch = await axios.get(
                    `${ASAAS_URL}/payments?customer=${customerId}&status=PENDING&limit=1&sort=dateCreated&order=desc`, 
                    { headers }
                );
                if (custSearch.data.data && custSearch.data.data.length > 0) {
                    foundPayment = custSearch.data.data[0];
                }
            }

            // Se achou em qualquer um dos dois...
            if (foundPayment) {
                // Tenta pegar billUrl (boleto/pix) ou invoiceUrl (fatura)
                finalPaymentLink = foundPayment.billUrl || foundPayment.invoiceUrl;
                console.log(`✅ Link encontrado na tentativa ${i}: ${finalPaymentLink}`);
                break; 
            }

        } catch (e) {
            console.warn(`Tentativa ${i} falhou, tentando novamente...`);
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
    throw new HttpsError("internal", error.message);
  }
});

// --- 2. WEBHOOK (Essencial para liberar o app após pagar) ---
exports.asaasWebhook = onRequest(async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const event = req.body.event;
    const payment = req.body.payment || {};
    // Tenta achar o ID do usuário em vários lugares
    const userId = payment.externalReference || req.body.subscription?.externalReference;

    console.log(`[Webhook] Evento: ${event} | User: ${userId}`);

    if (!userId) return res.json({ received: true }); 

    try {
        const db = admin.firestore();
        const docRef = db.collection("stores").doc(userId); 

        if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
            await docRef.update({
                subscriptionStatus: "active",
                lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
                subscriptionId: payment.subscription || null
            });
            console.log(`>>> USUÁRIO ${userId} ATIVADO!`);
        } 
        else if (event === "PAYMENT_OVERDUE" || event === "SUBSCRIPTION_DELETED") {
            await docRef.update({ subscriptionStatus: "inactive" });
        }
        res.json({ received: true });
    } catch (error) {
        console.error("Erro Webhook:", error);
        res.status(500).send("Erro interno");
    }
});

// --- 3. Limpeza de Imagens (Mantido) ---
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