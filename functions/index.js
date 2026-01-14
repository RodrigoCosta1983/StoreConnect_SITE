const { onRequest } = require("firebase-functions/v2/https");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
// SUA CHAVE SECRETA DO STRIPE
const stripe = require("stripe")("sk_test_51RtadZF7qAVyn13sMeQ2Seal39Ms1uJnMfL7eibWBqp7TrsPZWFVIEjkR3pSLY9DdNmQtfAOe5r6NZZKwZzTmJ2U006uU487KD");

admin.initializeApp();

// 1. WEBHOOK (Ouve quando o pagamento cai)
exports.stripeWebhook = onRequest(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const endpointSecret = "whsec_VBOzucP5DbsbUAZMOrhuXZEt0RY9qfRR"; // Seu segredo do webhook

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Evento de "Checkout Completado" (Alguém pagou!)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id; // ID do usuário que mandamos no checkout
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    if (userId) {
      try {
        console.log(`💰 Pagamento confirmado para: ${userId}`);
        
        // Salva os dados no usuário
        await admin.firestore().collection("users").doc(userId).set({
            stripeCustomerId: customerId, 
            activeSubscriptionId: subscriptionId,
            subscriptionStatus: "active" // Libera o acesso!
        }, { merge: true });

        // Se tiver loja vinculada, libera também
        const userDoc = await admin.firestore().collection("users").doc(userId).get();
        if (userDoc.exists && userDoc.data().storeId) {
            await admin.firestore().collection("stores").doc(userDoc.data().storeId).update({
                subscriptionStatus: "active",
                subscriptionId: subscriptionId,
                lastPaymentDate: admin.firestore.FieldValue.serverTimestamp()
            });
        }
      } catch (error) {
        console.error("❌ Erro Firestore:", error);
      }
    }
  }
  res.json({received: true});
});

// 2. PORTAL (Para quem JÁ paga - ver faturas, cancelar)
exports.createPortalSession = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Usuário não logado.');

  const userId = request.auth.uid;
  const db = admin.firestore();
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.stripeCustomerId) {
    throw new HttpsError('failed-precondition', 'Nenhuma assinatura encontrada.');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: userData.stripeCustomerId,
    return_url: 'https://rodrigocosta1983.github.io/StoreConnect/Appland/painel.html',
  });

  return { url: session.url };
});

// 3. CHECKOUT (NOVO! Para quem vai assinar agora)
exports.createCheckoutSession = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Usuário não logado.');

  const userId = request.auth.uid;
  const userEmail = request.auth.token.email; // Pega o email do login

  // Cria a sessão de pagamento
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price: 'price_1RtaksF7qAVyn13sU1hY7R8l', // ID do seu PLANO R$ 25 (Vou confirmar se é esse mesmo)
      quantity: 1,
    }],
    success_url: 'https://rodrigocosta1983.github.io/StoreConnect/Appland/painel.html?sucesso=true',
    cancel_url: 'https://rodrigocosta1983.github.io/StoreConnect/Appland/painel.html',
    client_reference_id: userId, // Importante: vincula o pagamento ao ID do usuário
    customer_email: userEmail,   // Já preenche o email no checkout
  });

  return { url: session.url };
});