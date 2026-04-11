const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.broadcastNotif = functions.database
  .ref("/notifications/{id}")
  .onCreate(async (snap) => {
    const notif = snap.val();
    if (!notif || !notif.title) return null;

    const tokensSnap = await admin.database().ref("fcmTokens").once("value");
    const tokens = Object.keys(tokensSnap.val() || {});
    if (!tokens.length) return null;

    const res = await admin.messaging().sendEachForMulticast({
      tokens,
      data: { title: notif.title, body: notif.body || "" },
    });

    // Clean up invalid tokens
    const invalid = [];
    res.responses.forEach((r, i) => { if (!r.success) invalid.push(tokens[i]); });
    await Promise.all(
      invalid.map((t) =>
        admin.database().ref("fcmTokens/" + t.replace(/[.#$[\]]/g, "_")).remove()
      )
    );
    return null;
  });
