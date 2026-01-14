const functions = require("firebase-functions");
const admin = require("firebase-admin");
// SUBSTITUA PELA SUA CHAVE SECRETA DE TESTE DO STRIPE (sk_test_...)
const stripe = require("stripe")("sk_test_51RtadZF7qAVyn13sMeQ2Seal39Ms1uJnMfL7eibWBqp7TrsPZWFVIEjkR3pSLY9DdNmQtfAOe5r6NZZKwZzTmJ2U006uU487KD");

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