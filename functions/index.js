const { onValueCreated } = require("firebase-functions/v2/database");
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const { getDatabase } = require("firebase-admin/database");

initializeApp();

/**
 * Triggered whenever a new entry is pushed to /notifications.
 * Reads all stored FCM tokens and fans out a push message to every device,
 * then removes any tokens that the FCM service reported as invalid.
 */
exports.broadcastNotif = onValueCreated("/notifications/{id}", async (event) => {
  const notif = event.data.val();
  if (!notif?.title) return;

  const tokensSnap = await getDatabase().ref("fcmTokens").once("value");
  const tokenMap = tokensSnap.val() || {};
  const tokens = Object.keys(tokenMap);
  if (!tokens.length) return;

  const res = await getMessaging().sendEachForMulticast({
    tokens,
    // Use the `data` field so firebase-messaging-sw.js receives it via onBackgroundMessage
    data: {
      title: notif.title,
      body: notif.body || "",
    },
  });

  // Clean up tokens that FCM says are no longer valid
  const invalid = [];
  res.responses.forEach((r, i) => {
    if (!r.success) invalid.push(tokens[i]);
  });
  await Promise.all(
    invalid.map((t) =>
      getDatabase()
        .ref("fcmTokens/" + t.replace(/[.#$[\]]/g, "_"))
        .remove()
    )
  );
});
