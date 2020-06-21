const nodeMailer = require('nodemailer')
const config = require('../config')
const jwt = require('jsonwebtoken')

const usePasswordHashToMakeToken = ({ password: passwordHash, _id: userId, createdAt }) => {
    // highlight-start
    const secret = passwordHash + "-" + createdAt
    const token = jwt.sign({ userId }, secret, {
      expiresIn: 3600 // 1 hour
    })
    // highlight-end
    return token
}

const sendEmail = async (message, header, mail) => {
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            // should be replaced with real sender's account
            user: config.EMAIL_USER,
            pass: config.EMAIL_PASS
        }
    });
    let mailOptions = {
        // should be replaced with real recipient's account
        to: mail,
        subject: header,
        body: message
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return error
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    })
}


module.exports = { sendEmail, usePasswordHashToMakeToken }