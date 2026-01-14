const functions = require("firebase-functions");
const admin = require("firebase-admin");
// SUBSTITUA PELA SUA CHAVE SECRETA DE TESTE DO STRIPE (sk_test_...)
// Carrega as variáveis do arquivo .env
 

// Pega a chave do ambiente
// Tenta pegar a config. Se não existir (rodando local), usa uma string vazia para não travar o deploy
const stripeConfig = functions.config().stripe || {};
const stripe = require("stripe")(stripeConfig.secret || "sk_test_chave_falsa_apenas_para_deploy");
admin.initializeApp();

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  
  // Você vai pegar esse segredo no Dashboard do Stripe DEPOIS de fazer o deploy.
  // Por enquanto, deixe vazio ou com string aleatória para o primeiro deploy...
  const endpointSecret = "whsec_VBOzucP5DbsbUAZMOrhuXZEt0RY9qfRR";


  let event;

  try {
    // Verifica se a chamada veio mesmo do Stripe (Segurança)
    // Se você ainda não tem o endpointSecret, comente a linha abaixo e use: event = req.body;
    // mas LEMBRE-SE de descomentar para produção!
    event = stripe.webhooks.constructEvent(req.rawBody, signature, endpointSecret);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Lidar com o evento de Checkout Completo
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id; // Aquele ID que mandamos no botão!

    console.log(`💰 Pagamento recebido do usuário: ${userId}`);

    if (userId) {
      try {
        // 1. Buscar o usuário para descobrir qual é a loja dele
        const userDoc = await admin.firestore().collection("users").doc(userId).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            const storeId = userData.storeId;

            if (storeId) {
                // 2. Ativar a Loja
                await admin.firestore().collection("stores").doc(storeId).update({
                    subscriptionStatus: "active",
                    subscriptionId: session.subscription, // Guarda o ID da assinatura para cancelar depois se precisar
                    lastPaymentDate: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Loja ${storeId} ativada com sucesso!`);
            } else {
                console.error("❌ Usuário não tem storeId vinculado.");
            }
        }
      } catch (error) {
        console.error("❌ Erro ao atualizar Firestore:", error);
      }
    }
  }

  res.json({received: true});
});


// Função que cria o link do Portal
exports.createPortalSession = functions.https.onCall(async (data, context) => {
  // 1. Segurança: Verifica se o usuário está logado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não logado.');
  }

  const userId = context.auth.uid;
  const db = admin.firestore();

  // 2. Busca o ID do Cliente Stripe (customerId) no banco
  // IMPORTANTE: Seu Webhook precisa ter salvo o 'stripeCustomerId' na coleção 'users' ou 'stores'
  // Vamos assumir que está no documento do usuário em 'users'
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  // Se você salvou o customerId dentro da LOJA, mude a lógica acima para buscar na 'stores'
  const customerId = userData.stripeCustomerId; 

  if (!customerId) {
    throw new functions.https.HttpsError('failed-precondition', 'Cliente Stripe não encontrado para este usuário.');
  }

  // 3. Pede ao Stripe o link mágico
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'https://store-connect-app.web.app/painel.html', // Para onde ele volta ao sair
  });

  // 4. Devolve o link para o Frontend
  return { url: session.url };
});