const nodemailer = require("nodemailer");
const path = require('path');

const handImagePath = path.join(__dirname, '../../public/images/hand.png');
const logoImagePath = path.join(__dirname, '../../public/images/logo.png');

export const sendEmail = async (subject: string, message:string, send_to:string, sent_from:string) => {
    console.log('email',process.env.EMAIL_HOST,process.env.EMAIL_USER,process.env.EMAIL_PASS)
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
                cid:"logo"
              }
          ]
    }
    try {
        await transporter.sendMail(options);
        return true;
    } catch (error) {
      console.log(error)
        return false;
    }

};