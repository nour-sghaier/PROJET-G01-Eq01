const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

(async () => {
  try {
    const ref = db.collection("_healthcheck").doc("test");
    await ref.set({ ok: true, at: new Date() });
    const snap = await ref.get();
    console.log("Lecture OK :", snap.data());
    await ref.delete();
    console.log("Connexion Firestore OK");
  } catch (e) {
    console.error("Échec connexion Firestore :", e.message);
  }
  process.exit();
})();