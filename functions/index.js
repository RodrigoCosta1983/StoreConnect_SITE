const { onRequest } = require("firebase-functions/v2/https");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const stripe = require("stripe")("sk_test_51RtadZF7qAVyn13sMeQ2Seal39Ms1uJnMfL7eibWBqp7TrsPZWFVIEjkR3pSLY9DdNmQtfAOe5r6NZZKwZzTmJ2U006uU487KD");

admin.initializeApp();

// --- WEBHOOK (Mantivemos onRequest, mas agora v2) ---
exports.stripeWebhook = onRequest(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const endpointSecret = "whsec_VBOzucP5DbsbUAZMOrhuXZEt0RY9qfRR";

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    if (userId) {
      try {
        await admin.firestore().collection("users").doc(userId).set({
            stripeCustomerId: customerId, 
            activeSubscriptionId: subscriptionId
        }, { merge: true });

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

// --- FUNÇÃO DO PORTAL (ATUALIZADA PARA V2) ---
// Note que agora usamos 'onCall' da v2 e o argumento é 'request'
exports.createPortalSession = onCall(async (request) => {
  // 1. Na v2, a autenticação fica dentro de request.auth
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Usuário não logado (Erro de Auth).');
  }

  const userId = request.auth.uid;
  const db = admin.firestore();

  // 2. Busca dados
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  const customerId = userData.stripeCustomerId; 

  if (!customerId) {
    throw new HttpsError('failed-precondition', 'Cliente Stripe não encontrado.');
  }

  // 3. Cria link
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'https://store-connect-app.web.app/painel.html',
  });

  return { url: session.url };
});