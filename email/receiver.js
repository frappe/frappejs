const frappe = require('frappejs');
const ImapClient = require('emailjs-imap-client').default;
const simpleParser = require('mailparser').simpleParser;

module.exports = {
  sync: async ({
    email,
    syncOption
  }) => {
    let account = await frappe.db.getAll({
      doctype: 'EmailAccount',
      fields: ['email', 'password', 'imapHost', 'imapPort', 'initialDate'],
      filters: {
        email: email,
      }
    });
    account = account[0];
    const client = new ImapClient(account.imapHost, account.imapPort, {
      useSecureTransport: true,
      logLevel: 'error',
      auth: {
        user: account.email,
        pass: account.password
      }
    });
    client.onerror = function (error) {
      console.log(error)
    };

    var MailBoxMap = {
      "SENT": "[Gmail]/Sent Mail",
      "INBOX": "INBOX", // TODO: FILTER to find only unseen
      "STARRED": "[Gmail]/Starred", // REM
      "DRAFT": "[Gmail]/Drafts",
      "SPAM": "[Gmail]/Spam",
      "TRASH": "[Gmail]/Trash"
    };

    var sent = 0;
    var read = "Unseen";
    // FIX THIS
    if (syncOption != "INBOX") {
      sent = 1;
      read = "Seen";
    }


    client.connect().then(() => {
      client.listMessages(MailBoxMap[syncOption], '1:*', ['uid', 'flags', 'envelope', 'body[]']).then((messages) => {
        messages.forEach((message) => {
          simpleParser(message['body[]']).then(async function (parsed) {
            // message.envelope.from[0].name to DisplayName Field :TODO
            // ccEmailAddress ,bccEmailAddress UNAVAILABLE : TODO
            // save to , from in "," seperated and split at interface :TODO

            var mailObject = {
              doctype: 'Email',
              name: message.envelope['message-id'] + syncOption,
              fromEmailAddress: message.envelope.from[0].address,
              toEmailAddress: message.envelope.to[0].address,
              // ccEmailAddress: message.envelope.cc[0].address,
              // bccEmailAddress: message.envelope.bcc[0].address,
              date: new Date(message.envelope.date),
              subject: message.envelope.subject,
              bodyHtml: parsed.html,
              bodyText: parsed.text,
              sent: sent,
              read: read,
              syncOption: syncOption,
            }
            if (await frappe.db.exists('Email', mailObject.name) == false) {
              await frappe.insert(mailObject);
            }
          }).catch(function (err) {
            console.log('An error occurred:', err.message);
          });
        });
      });
    });

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function wait() {
      await sleep(5000);
      client.close().then(() => {
        console.log("Done Fetching!. CLOSED CONNECTION")
      });
    }
    wait();
  }
}