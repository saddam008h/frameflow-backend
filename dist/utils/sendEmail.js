"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer = require("nodemailer");
const path = require('path');
const handImagePath = path.join(__dirname, '../../public/images/hand.png');
const logoImagePath = path.join(__dirname, '../../public/images/logo.png');
const sendEmail = async (subject, message, send_to, sent_from) => {
    console.log('email', process.env.EMAIL_HOST, process.env.EMAIL_USER, process.env.EMAIL_PASS);
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_HOST,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const options = {
        from: sent_from,
        to: send_to,
        subject: subject,
        html: message,
        attachments: [
            {
                filename: 'hand.png',
                path: handImagePath,
                cid: 'hand'
            },
            {
                filename: 'logo.png',
                path: logoImagePath,
                cid: "logo"
            }
        ]
    };
    try {
        await transporter.sendMail(options);
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map