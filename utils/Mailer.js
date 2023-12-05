var _ = require("lodash");
const nodemailer = require("nodemailer");
require('dotenv').config();

var config = {
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "thenetafrica@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
};

var transporter = nodemailer.createTransport(config);

var defaultMail = {
  from: "thenetafrica@gmail.com",
  text: "test test",
};

const send = (to, subject, body) => {
  // Use default setting and include the 'body' as HTML content
  var mail = _.merge({ html: body }, defaultMail, to);

  transporter.sendMail(mail, function (error, info) {
    if (error) return console.log(error);
    console.log("mail sent", info.response);
  });
};

module.exports = { send };
