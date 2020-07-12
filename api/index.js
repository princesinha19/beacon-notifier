const express = require('express');
const router = express.Router();
const axios = require("axios");
const nodemailer = require("nodemailer");
const TelegramBot = require('node-telegram-bot-api');
const ValidatorInfo = require("./models/ValidatorInfo");

let epoch = 0;

const bot = new TelegramBot(
    process.env.TELEGRAM_BOT_TOKEN,
    { polling: true },
);

const checkValidatorStatus = async (epoch) => {
    const validators = await ValidatorInfo.find();

    if (validators.length > 0) {
        validators.forEach(validator => {
            request('/validator/statuses?indices=' + validator.index)
                .then((data) => {
                    if (
                        data.statuses[0].status !== "ACTIVE" &&
                        data.statuses[0].status !== "DEPOSITED"
                    ) {
                        if (validator.email) {
                            sendEmail(
                                validator.email,
                                validator.index,
                                epoch,
                            );
                        }

                        if (validator.telegramUserId) {
                            sendTelegram(
                                validator.telegramUserId,
                                validator.index,
                                epoch,
                            );
                        }

                        console.log(
                            "Validator with index " +
                            validator.index + " is offline in epoch " +
                            epoch
                        );
                    }
                })
                .catch((error) => {
                    console.log(error.message)
                });
        });
    }
};

const request = (path) => {
    return new Promise((resolve, reject) => {
        axios.get(process.env.BEACON_CHAIN + '/eth/v1alpha1' + path)
            .then((res) => {
                resolve(res.data)
            })
            .catch((error) => {
                reject(error)
            });
    });
};

setInterval(() => {
    request('/beacon/chainhead')
        .then((result) => {
            if (result.headEpoch !== epoch) {
                checkValidatorStatus(result.headEpoch);
                epoch = result.headEpoch;
            }
        })
        .catch((error) => {
            console.log(error.message)
        });
}, 5000);

const sendTelegram = (chatId, index, epoch) => {
    bot.sendMessage(
        chatId,
        "Your validator with index " + index +
        " is offline in current epoch " + epoch +
        ". Kindly restart your validator to continue earning."
    );
}

const sendEmail = async (reciever, index, epoch) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    let info = await transporter.sendMail({
        from: '"Beacon Notifier 👻" <beacon.notifier@gmail.com>',
        to: reciever,
        subject: "Validator Down ✘",
        html: "<p>Hello,<p>" +
            "<p> Your validator with index " + index +
            " is <strong>offline</strong> in current epoch <strong>" +
            epoch + "<strong>.</p>" +
            "<p>Kindly restart your validator to continue earning.</p>" +
            "<br>" +
            "<p><img " +
            "src='https://lh3.googleusercontent.com/proxy/FHchhdZf5ZBhZsjTaE30IgAhcJMFxpkezNHxaO6DEV4jwFb_NDkDQhu5rnEN-qEs2TZe0_JBI1V33tYV4JGH_wRckK6n8xQh6scvtkIett2uCNTOVkAdf3UpXVyswfM'" +
            "alt='Alert image' " +
            "style='width:220px;height:200px;'" +
            "/></p>" +
            "<br>" +
            "<p>Regards</p>" +
            "<p>Beacon Notifier 👻</p>"
    });

    console.log("Message sent: %s", info.messageId);
};

const checkValidatorExists = (userId, index) => {
    return new Promise((resolve, reject) => {
        ValidatorInfo.find
            (
                {
                    $and: [
                        { index },
                        { telegramUserId: userId }
                    ]
                }
            )
            .then((result) => {
                if (result.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch((error) => {
                reject(error)
            });
    });
}

bot.onText(/\/subscribe (.+)/, async (msg, match) => {
    checkValidatorExists(msg.chat.id, match[1])
        .then((result) => {
            if (!result) {
                const newValidator = new ValidatorInfo({
                    index: match[1],
                    telegramUserId: msg.chat.id,
                });

                newValidator.save()
                    .then(() => {
                        bot.sendMessage(
                            msg.chat.id,
                            "Succesfully subscribed !!"
                        );
                    })
                    .catch((error) => {
                        console.log(error.message);
                    })
            } else {
                bot.sendMessage(
                    msg.chat.id,
                    "Index already subscribed !!"
                );
            }
        })
        .catch((error) => {
            console.log(error.message);
        })
});

bot.onText(/\/unsubscribe (.+)/, (msg, match) => {
    checkValidatorExists(msg.chat.id, match[1])
        .then((result) => {
            if (result) {
                ValidatorInfo.deleteOne
                    (
                        {
                            $and: [
                                { index: match[1] },
                                { telegramUserId: msg.chat.id }
                            ]
                        }
                    )
                    .then(() => {
                        bot.sendMessage(
                            msg.chat.id,
                            "Succesfully Unsubscribed !!"
                        );
                    })
                    .catch((error) => {
                        console.log(error.message);
                    });
            } else {
                bot.sendMessage(
                    msg.chat.id,
                    "Index not subscribed !!"
                );
            }
        })
        .catch((error) => {
            console.log(error.message);
        })
});

bot.on("polling_error", (err) => console.log(err));

module.exports = router;
