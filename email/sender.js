const nodemailer = require('nodemailer');
const getConfig = require("./getConfig");
const validator = require('./validator');

module.exports = {
  'sendMail': async function (mailDetails) {
    if (!validator.validate(mailDetails.fromEmailAddress)) {
      console.log("invalid from email");
      return false;
    }

    let account = await getConfig();
    for (var i = 0; i < account.length; i++) {
      if (mailDetails.fromEmailAddress == account[i].email) {
        if (validator.validate(mailDetails.toEmailAddress)) {
          mailDetails = {
            from: mailDetails.fromEmailAddress,
            to: mailDetails.toEmailAddress,
            cc: mailDetails.ccEmailAddress,
            bcc: mailDetails.bccEmailAddress,
            subject: mailDetails.subject,
            text: mailDetails.bodyText,
          };
          let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: account[i].email,
              pass: account[i].password,
            }
          });
          transporter.sendMail(mailDetails);
          return true;
        } else {
          console.log("Sender Email Invalid");
          return false;
        }
      }
    }
    return false;
    console.log(mailDetails.fromEmailAddress + " NOT FOUND IN RECORDS");
  }
};
