# Beacon Notifier
A notifier for Beacon Chain Validator. This notification service is for the Onyx Testnet of Prysm ETH2 Client.
The application sends an email or a telegram message if your validator is offline in the current epoch.

There are two ways to get notified:-

1. Subscribe yourself using web form and get notification on your email.
2. Subscribe for notification using telegram bot (https://t.me/beacon_notify_bot)

Anytime you can unsubscribe using any service either web form or telegram bot. Both have option to unsubscribe.

Their is an additional service on web app, to check the validaor status using Validator Index.
The status shows the current status of the validator with the staked balance, activation epoch and slashing info.

## Steps to run project
1. Clone the repository
2. Go inside the directory and install all dependencies using NPM.
3. Create a .env file based on sample.env file.
4. Start Onyx testnet on your local machine.
5. Start MongoDB.
6. Start Frontend Client using `npm run start` inside client folder.
7. Start the backend using `npm run start`
8. You can go to http://127.0.0.1:3000 to see the page.

## Prerequisite
1. Onyx Testnet
2. Node & NPM
3. MongoDB
