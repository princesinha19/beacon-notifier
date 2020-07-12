const express = require('express');
const router = express.Router();
const axios = require("axios");
const nodemailer = require("nodemailer");
const ValidatorInfo = require("./models/ValidatorInfo");
let epoch = 0;

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
                        sendEmail(validator.email, validator.index, epoch);

                        console.log(
                            "Validator with index " +
                            validator.index + " was offline in epoch " +
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
        html: "<p>Hello your validator is <strong>inactive.</strong></p>" +
            "<p><img src='&lt;source&gt;' alt='Alert image' /></p>",
    });

    console.log("Message sent: %s", info.messageId);
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

module.exports = router;