// --- IMPORTS ---
// V1 para a função HTTPS (Asaas)
const functions = require('firebase-functions');
// V2 para a função do Firestore (Limpeza de Produtos)
const { onDocumentDeleted } = require("firebase-functions/v2/firestore");

const admin = require('firebase-admin');
const axios = require("axios");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// --- CONFIGURAÇÃO DO ASAAS ---
const ASAAS_URL = "https://www.asaas.com/api/v3";
// Se quiser usar o Sandbox (teste) do Asaas, mude a URL para: https://sandbox.asaas.com/api/v3

/**
 * 1. FUNÇÃO: createAsaasSubscription (Sintaxe V1 - HTTPS)
 * Objetivo: Cria o cliente e a assinatura no Asaas
 */
exports.createAsaasSubscription = functions.https.onCall(async (data, context) => {
  // --- CORREÇÃO AQUI: Usando variável de ambiente (.env) ---
  const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 

  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Usuário não logado.");
  }

  const { cpfCnpj, name, phone, email } = data;
  const userId = context.auth.uid;

  const headers = {
    "access_token": ASAAS_API_KEY,
    "Content-Type": "application/json"
  };

  try {
    console.log(`[Asaas] Iniciando assinatura para: ${email} | CPF: ${cpfCnpj}`);

    // A: Verificar se cliente existe
    const searchResponse = await axios.get(`${ASAAS_URL}/customers?cpfCnpj=${cpfCnpj}`, { headers });
    
    let customerId;

    if (searchResponse.data.data && searchResponse.data.data.length > 0) {
      customerId = searchResponse.data.data[0].id;
      console.log(`[Asaas] Cliente encontrado: ${customerId}`);
    } else {
      // B: Criar cliente novo
      const createResponse = await axios.post(`${ASAAS_URL}/customers`, {
        name: name,
        email: email,
        cpfCnpj: cpfCnpj,
        phone: phone || "",
        externalReference: userId,
        notificationDisabled: false,
      }, { headers });
      customerId = createResponse.data.id;
      console.log(`[Asaas] Novo cliente criado: ${customerId}`);
    }

    // C: Criar Assinatura (R$ 29,90)
    const subscriptionResponse = await axios.post(`${ASAAS_URL}/subscriptions`, {
      customer: customerId,
      billingType: "UNDEFINED", // Cliente escolhe a forma de pagamento
      value: 29.90,
      nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cycle: "MONTHLY",
      description: "Assinatura Store Connect Pro",
      externalReference: userId
    }, { headers });

    console.log("[Asaas] Assinatura criada com sucesso!");

    return {
      success: true,
      paymentUrl: subscriptionResponse.data.billUrl,
      subscriptionId: subscriptionResponse.data.id
    };

  } catch (error) {
    console.error("[Asaas] Erro:", error.response ? error.response.data : error.message);
    throw new functions.https.HttpsError("internal", "Erro Asaas", error.response ? error.response.data : error.message);
  }
});

/**
 * 2. FUNÇÃO: onProductDelete (Sintaxe V2 - Firestore)
 * Objetivo: Limpa a imagem quando produto é deletado.
 */
exports.onProductDelete = onDocumentDeleted(
  "stores/{storeId}/products/{productId}",
  async (event) => {
    const deletedData = event.data && event.data.data();
    
    if (!deletedData) {
      console.log("Nenhum dado encontrado no evento de deleção.");
      return;
    }

    let imageRefValue = deletedData.imagePath ?? deletedData.imageUrl ?? null;
    if (!imageRefValue) return;

    const bucket = admin.storage().bucket();
    let filePath = null;

    try {
      if (String(imageRefValue).startsWith('gs://')) {
        filePath = String(imageRefValue).replace(/^gs:\/\/[^\/]+\/?/, '');
      } else if (String(imageRefValue).startsWith('http')) {
        try {
          const url = new URL(String(imageRefValue));
          const m = url.pathname.match(/\/o\/([^?]+)/);
          if (m && m[1]) filePath = decodeURIComponent(m[1]);
        } catch (err) { console.warn(err); }
      } else {
        filePath = String(imageRefValue);
      }

      if (!filePath) return;

      const file = bucket.file(filePath);
      const [exists] = await file.exists();
      if (exists) {
        await file.delete();
        console.log(`[onProductDelete] Imagem deletada: ${filePath}`);
      }
      
      return;
    } catch (error) {
      console.error(`Erro ao deletar imagem:`, error);
      return;
    }
  }
);