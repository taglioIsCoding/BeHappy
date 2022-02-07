const express = require('express');
const {
  Expo
} = require('expo-server-sdk')
const fetch = require("node-fetch");
var schedule = require('node-schedule');
const firebase = require('firebase');
const firebaseConfig = {
  apiKey: "AIzaSyDdb_E0FJuBlT0X5nhoyvBzK-OSeu7iTHs",
  authDomain: "behappy-28fcd.firebaseapp.com",
  databaseURL: "https://behappy-28fcd.firebaseio.com",
  projectId: "behappy-28fcd",
  storageBucket: "behappy-28fcd.appspot.com",
  messagingSenderId: "1003788420516",
  appId: "1:1003788420516:web:4f27b74353e8a247b72d31",
  measurementId: "G-9M5EXKL78Y"
};

const app = express();
firebase.initializeApp(firebaseConfig)

let pushTokens = []
let compliment

//Get all the user push token from the DB
GetUserPushTokens = () => {
  pushTokens = [];
  var leadsRef = firebase.database().ref('users/');
  leadsRef.on('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      let childData = childSnapshot.val();
      pushTokens.push(childData.push_token)
    });
  })
}



app.get('/', (req, res) => {
  res.send('Hello the BeHappy app server!')
});

app.listen(3000, () => {
  console.log('server started');
  GetUserPushTokens();
  //every day at 12 UTC +1 send the notification
  var j = schedule.scheduleJob('30 * * * *', function () {


    console.log('it is time to send!')


    //fetch the compliment  
    fetch('https://complimentr.com/api')
      .then((response) => response.json())
      .then((body) => {
        compliment = body.compliment;
      })
      .then((body) => {

        let expo = new Expo();
        let messages = [];
        let somePushTokens = [];
        somePushTokens = pushTokens
        console.log(somePushTokens)
        for (let pushToken of somePushTokens) {
          // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

          // Check that all your push tokens appear to be valid Expo push tokens
          if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
          }

          // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications)
          messages.push({
            to: pushToken,
            sound: 'default',
            body: compliment,
            data: {
              withSome: 'data'
            },
          })
        }

        // The Expo push notification service accepts batches of notifications so
        // that you don't need to send 1000 requests to send 1000 notifications. We
        // recommend you batch your notifications to reduce the number of requests
        // and to compress them (notifications with similar content will get
        // compressed).
        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];
        (async () => {
          // Send the chunks to the Expo push notification service. There are
          // different strategies you could use. A simple one is to send one chunk at a
          // time, which nicely spreads the load out over time:
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
              //------------------>console.log(ticketChunk);
              tickets.push(...ticketChunk);
              // NOTE: If a ticket contains an error code in ticket.details.error, you
              // must handle it appropriately. The error codes are listed in the Expo
              // documentation:
              // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
            } catch (error) {
              console.error(error);
            }
          }
        })();


        // Later, after the Expo push notification service has delivered the
        // notifications to Apple or Google (usually quickly, but allow the the service
        // up to 30 minutes when under load), a "receipt" for each notification is
        // created. The receipts will be available for at least a day; stale receipts
        // are deleted.
        //
        // The ID of each receipt is sent back in the response "ticket" for each
        // notification. In summary, sending a notification produces a ticket, which
        // contains a receipt ID you later use to get the receipt.
        //
        // The receipts may contain error codes to which you must respond. In
        // particular, Apple or Google may block apps that continue to send
        // notifications to devices that have blocked notifications or have uninstalled
        // your app. Expo does not control this policy and sends back the feedback from
        // Apple and Google so you can handle it appropriately.
        let receiptIds = [];
        for (let ticket of tickets) {
          // NOTE: Not all tickets have IDs; for example, tickets for notifications
          // that could not be enqueued will have error information and no receipt ID.
          if (ticket.id) {
            receiptIds.push(ticket.id);
          }
        }

        let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        (async () => {
          // Like sending notifications, there are different strategies you could use
          // to retrieve batches of receipts from the Expo service.
          for (let chunk of receiptIdChunks) {
            try {
              let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
              //---------->console.log(receipts);

              // The receipts specify whether Apple or Google successfully received the
              // notification and information about an error, if one occurred.
              for (const receiptId in receipts) {
                const {
                  status,
                  message,
                  details
                } = receipts[receiptId];
                if (status === "ok") {
                  continue;
                } else if (status === "error") {
                  console.error(
                    `There was an error sending a notification: ${message}`
                  );
                  if (details && details.error) {
                    // The error codes are listed in the Expo documentation:
                    // https://docs.expo.io/versions/latest/guides/push-notifications/#individual-errors
                    // You must handle the errors appropriately.
                    console.error(`The error code is ${details.error}`);
                  }
                }
              }
            } catch (error) {
              console.error(error);
            }
          }
        })();
        GetUserPushTokens();
      });
  });
});