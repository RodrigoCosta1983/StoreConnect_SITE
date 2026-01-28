const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentDeleted } = require("firebase-functions/v2/firestore");
const admin = require('firebase-admin');
const axios = require("axios");

admin.initializeApp();

const ASAAS_URL = "https://www.asaas.com/api/v3";
// Se for teste use: "https://sandbox.asaas.com/api/v3"

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function cleanCpfCnpj(value) {
    if (!value) return "";
    return value.replace(/\D/g, '');
}

// --- 1. FUNÇÃO DE CRIAR ASSINATURA (Versão V6 - Com Nome e Telefone) ---
exports.createAsaasSubscription = onCall({ timeoutSeconds: 120 }, async (request) => {
  console.log(">>> INICIANDO ASSINATURA (TRIAL 7 DIAS - V7 - SAVE LINK) <<<");
  const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 
  if (!request.auth) throw new HttpsError("unauthenticated", "Usuário não logado.");

  const cpfCnpj = cleanCpfCnpj(request.data.cpfCnpj);
  const { name, email, phone } = request.data; 
  
  if (!cpfCnpj || cpfCnpj.length < 11) throw new HttpsError("invalid-argument", "CPF inválido.");

  const userId = request.auth.uid;
  const trialDate = new Date();
  trialDate.setDate(trialDate.getDate() + 7);
  const nextDueDate = trialDate.toISOString().split('T')[0];
  const headers = { "access_token": ASAAS_API_KEY, "Content-Type": "application/json" };

  const customerData = {
    name: name, email: email, cpfCnpj: cpfCnpj, phone: phone, mobilePhone: phone, externalReference: userId
  };

  try {
    // 1. Cliente Asaas
    let customerId;
    const search = await axios.get(`${ASAAS_URL}/customers?cpfCnpj=${cpfCnpj}`, { headers });
    if (search.data.data && search.data.data.length > 0) {
        customerId = search.data.data[0].id;
        await axios.put(`${ASAAS_URL}/customers/${customerId}`, customerData, { headers });
    } else {
        const create = await axios.post(`${ASAAS_URL}/customers`, customerData, { headers });
        customerId = create.data.id;
    }

    // 2. Assinatura
    const subResponse = await axios.post(`${ASAAS_URL}/subscriptions`, {
        customer: customerId, billingType: "UNDEFINED", value: 15.90, nextDueDate: nextDueDate,
        cycle: "MONTHLY", description: "Assinatura Store Connect (7 Dias Grátis)", externalReference: userId
    }, { headers });
    const subscriptionId = subResponse.data.id;

    // 3. BUSCA O LINK DO BOLETO (AGORA É OBRIGATÓRIO ESPERAR PARA SALVAR)
    let finalPaymentLink = null;
    // Tenta buscar o link por até 10 segundos
    for (let i = 1; i <= 10; i++) {
        try {
            const subSearch = await axios.get(`${ASAAS_URL}/payments?subscription=${subscriptionId}&limit=1`, { headers });
            if (subSearch.data.data && subSearch.data.data.length > 0) {
                finalPaymentLink = subSearch.data.data[0].billUrl || subSearch.data.data[0].invoiceUrl;
                break; 
            }
        } catch (e) {}
        await delay(1000); 
    }

    // 4. ATUALIZA FIREBASE (SALVANDO O LINK)
    const db = admin.firestore();
    const batch = db.batch();
    const userRef = db.collection("users").doc(userId);
    
    // Atualiza User
    batch.update(userRef, { 
        subscriptionStatus: "active",
        trialEndsAt: admin.firestore.Timestamp.fromDate(trialDate),
        documentNumber: cpfCnpj, fullName: name, phone: phone
    });

    // Atualiza Loja (COM O LINK)
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.data() || {};
    let storeRef = null;
    if (userData.storeId) {
        storeRef = db.collection("stores").doc(userData.storeId);
    } else {
        const storeQuery = await db.collection("stores").where("ownerId", "==", userId).limit(1).get();
        if (!storeQuery.empty) storeRef = storeQuery.docs[0].ref;
    }

    if (storeRef) {
        batch.update(storeRef, { 
            subscriptionStatus: "active",
            trialEndsAt: admin.firestore.Timestamp.fromDate(trialDate),
            subscriptionId: subscriptionId,
            paymentLink: finalPaymentLink // <--- SALVANDO O LINK AQUI
        });
    }
    
    await batch.commit();

    return { success: true, paymentUrl: finalPaymentLink };

  } catch (error) {
    console.error("Erro Fatal:", error);
    throw new HttpsError("internal", error.message);
  }
});

// --- 2. WEBHOOK (INFALÍVEL: Usa storeId do Usuário) ---
exports.asaasWebhook = onRequest(async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const event = req.body.event;
    const payment = req.body.payment || {};
    const userId = payment.externalReference || req.body.subscription?.externalReference;

    console.log(`[Webhook] Evento: ${event} | User ID: ${userId}`);

    if (!userId) return res.json({ received: true }); 

    try {
        const db = admin.firestore();
        
        // 1. Busca o Usuário PRIMEIRO para pegar o storeId correto
        const userRef = db.collection("users").doc(userId);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            console.log("Usuário não encontrado.");
            return res.json({ received: true });
        }

        const userData = userSnapshot.data();
        const storeId = userData.storeId; // <--- O SEGREDO ESTÁ AQUI!

        let storeRef = null;
        if (storeId) {
            storeRef = db.collection("stores").doc(storeId);
            console.log(`✅ Loja identificada pelo ID no usuário: ${storeId}`);
        } else {
             // Fallback antigo (caso não tenha storeId no user)
             const storeQuery = await db.collection("stores").where("ownerId", "==", userId).limit(1).get();
             if (!storeQuery.empty) storeRef = storeQuery.docs[0].ref;
        }

        // 2. Define Status
        let newStatus = null;
        if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
            newStatus = "active";
        } else if (event === "PAYMENT_OVERDUE" || event === "SUBSCRIPTION_DELETED") {
            newStatus = "inactive";
        }

        // 3. Atualiza User e Loja
        if (newStatus) {
            const batch = db.batch();
            
            batch.update(userRef, { 
                subscriptionStatus: newStatus,
                lastPaymentDate: admin.firestore.FieldValue.serverTimestamp()
            });

            if (storeRef) {
                batch.update(storeRef, { 
                    subscriptionStatus: newStatus,
                    lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
                    subscriptionId: payment.subscription || null
                });
            }

            await batch.commit();
            console.log(`🚀 Sincronizado: User e Loja (${storeId}) viraram ${newStatus}`);
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error("Erro Webhook:", error);
        res.status(500).send("Erro interno");
    }
});

// Mantém a função de limpeza
exports.onProductDelete = onDocumentDeleted("stores/{storeId}/products/{productId}", async (event) => {
    // ... (seu código de delete permanece igual) ...
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

// --- 2. WEBHOOK (O XERIFE AUTOMÁTICO) ---
// Esta função recebe avisos do Asaas e atualiza o Firebase
exports.handleAsaasWebhook = onRequest(async (req, res) => {
    // 1. Segurança: Verifica se é um evento válido (opcional: validar token de acesso)
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    const event = req.body.event;
    const payment = req.body.payment;
    
    // O externalReference é o ID do usuário que enviamos na hora de criar a assinatura
    const userId = payment.externalReference;

    console.log(`🔔 Webhook Recebido: ${event} para UserID: ${userId}`);

    if (!userId) {
        console.log("Ignorando evento sem externalReference (UserID).");
        return res.json({ received: true });
    }

    // 2. Define o novo status baseado no evento do Asaas
    let newStatus = null;
    let updateFields = {};

    switch (event) {
        case "PAYMENT_CONFIRMED":
        case "PAYMENT_RECEIVED":
            // Pagou! Libera o acesso.
            newStatus = "active";
            updateFields = {
                subscriptionStatus: "active",
                lastPaymentDate: admin.firestore.Timestamp.now()
            };
            console.log(`✅ Pagamento confirmado! Liberando acesso para ${userId}`);
            break;

        case "PAYMENT_OVERDUE":
            // Venceu e não pagou! Bloqueia.
            newStatus = "inactive";
            updateFields = {
                subscriptionStatus: "inactive"
            };
            console.log(`⛔ Pagamento atrasado! Bloqueando acesso de ${userId}`);
            break;

        case "SUBSCRIPTION_DELETED":
            // Cancelou a assinatura! Bloqueia.
            newStatus = "canceled";
            updateFields = {
                subscriptionStatus: "canceled"
            };
            console.log(`❌ Assinatura cancelada para ${userId}`);
            break;
            
        default:
            console.log(`Evento ${event} ignorado.`);
            return res.json({ received: true });
    }

    try {
        const db = admin.firestore();
        const batch = db.batch();

        // 3. Atualiza a Coleção 'users'
        const userRef = db.collection("users").doc(userId);
        batch.set(userRef, updateFields, { merge: true });

        // 4. Atualiza a Coleção 'stores' (Busca a loja desse dono)
        const storesQuery = await db.collection("stores").where("ownerId", "==", userId).get();
        
        if (!storesQuery.empty) {
            storesQuery.forEach(doc => {
                batch.set(doc.ref, updateFields, { merge: true });
            });
        }

        await batch.commit();
        console.log("Banco de dados sincronizado com sucesso.");

        // Responde para o Asaas que deu tudo certo
        return res.json({ received: true });

    } catch (error) {
        console.error("Erro ao processar Webhook:", error);
        return res.status(500).send("Erro interno");
    }
});