const frappe = require('frappejs');
const simpleParser = require('mailparser').simpleParser;
const Imap = require('imap');

module.exports = {
  sync: async ({email, syncOption}) => {
    // could be replaced with getDoc if account name is set same as email
    let account = await frappe.db.getAll({
      doctype: 'EmailAccount',
      fields: ['email', 'password', 'imapHost', 'imapPort', 'initialDate'],
      filters: {
        email
      }
    });
    account = account[0]

    var config = {
      "user": account.email,
      "password": account.password,
      "host": account.imapHost,
      "port": account.imapPort,
      "tls": true,
    }

    var imap = new Imap(config);
    function openInbox(cb) {
      imap.openBox('INBOX', true, cb);
    }

    imap.once('ready', function () {

      openInbox(function (err, box) {

        if (err) throw err;
        imap.search([syncOption, ['SINCE', account.initialDate]], function (err, results) {
          if (err) throw err;
          var fetch = imap.fetch(results, {
            bodies: ''
          });
          fetch.on('message', function (msg, seqno) {
            msg.on('body', function (stream, info) {

              simpleParser(stream)
                .then(async function (mail_object) {
                  await frappe.insert({
                    doctype: 'Email',
                    fromEmailAddress: mail_object.from.value[0].address,
                    toEmailAddress: mail_object.to.value[0].address,
                    ccEmailAddress: mail_object.cc,
                    bccEmailAddress: mail_object.bcc,
                    date: mail_object.date,
                    subject: mail_object.subject,
                    bodyHtml: mail_object.html,
                    bodyText: mail_object.text,
                    sent: 0,
                  });
                })
                .catch(function (err) {
                  console.log('An error occurred:', err.message);
                });
            });
          });

          fetch.once('error', function (err) {
            console.log('Fetch error: ' + err);
          });

          fetch.once('end', function () {
            console.log('Done fetching all messages!');
            imap.end();
          });
        });
      });
    });

    imap.once('error', function (err) {
      console.log(err);
    });

    imap.once('end', function () {
      console.log('Connection ended');
    });

    imap.connect();
  }
}
