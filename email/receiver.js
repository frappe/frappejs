
const frappe = require('frappejs');
const ImapClient = require('emailjs-imap-client').default;
const simpleParser = require('mailparser').simpleParser;

module.exports = {
  sync: async ({
    email,
    syncOption
  }) => {
    // could be replaced with getDoc if account name is set same as email
    let account = await frappe.db.getAll({
      doctype: 'EmailAccount',
      fields: ['email', 'password', 'imapHost', 'imapPort', 'initialDate'],
      filters: {
        email: email,
      }
    });
    account = account[0];
    const client = new ImapClient(account.imapHost, account.imapPort, {
      useSecureTransport:true,
      logLevel:'error',
      auth: {
        user: account.email,
        pass: account.password
      }
    });
    client.onerror = function (error) {console.log(error)};

    client.connect().then(() => {
      client.listMessages('INBOX', '10:*', ['uid', 'flags', 'envelope', 'body[]']).then((messages) => {
        messages.forEach((message) => {
          simpleParser(message['body[]']).then(async function (parsed){
            // message.envelope.from[0].name to DisplayName Field :TODO
            // ccEmailAddress ,bccEmailAddress UNAVAILABLE : TODO
            // save to , from in "," seperated and split at interface :TODO
            await frappe.insert({
              doctype: 'Email',
              name: message.envelope['message-id'],
              fromEmailAddress: message.envelope.from[0].address,
              toEmailAddress: message.envelope.to[0].address,
              //ccEmailAddress: message.envelope.cc[0].address,
              //bccEmailAddress: message.envelope.bcc[0].address,
              date: message.envelope.date,
              subject: message.envelope.subject,
              bodyHtml: parsed.html,
              bodyText: parsed.text,
              sent: 0,
            })
          }).catch(function (err) {
            console.log('An error occurred:', err.message);
          });
        });
      });
    });
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function demo() {
      await sleep(5000);
      client.close().then(() => { console.log("Done Fetching!. CLOSED CONNECTION") });
    }
    demo();  
  }
}