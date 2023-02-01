const Crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.fEmail,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = {
  emailOtp: (code, email, callback, Status) => {
    if (Status) {
      transporter.sendMail({
        from: `${process.env.fEmail}`,
        to: email,
        subject: 'Otp verification',
        html: `<h1>${code}</h1>`,
      });
      callback();
    }
  },
};
