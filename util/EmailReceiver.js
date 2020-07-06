const MailListener = require("../lib/node_modules/mail-listener2");

let emailReceiver = {
    mailListener: null,
    handler:null,
    stop: function(){
        try{
            this.mailListener.stop();
        }catch(err){
            console.log("Mail listener not stopped. Error: " + err)
        }
    },
    init: function(mailOptions){
        
        this.mailListener = new MailListener({
            username: mailOptions.username,
            password: mailOptions.password,
            host: mailOptions.host,
            port: mailOptions.port, // imap port
            tls: mailOptions.tls,
            connTimeout: !mailOptions.connTimeout ? 10000 : mailOptions.connTimeout, // Default by node-imap
            authTimeout: !mailOptions.authTimeout ? 5000 : !mailOptions.authTimeout, // Default by node-imap,
            tlsOptions: { rejectUnauthorized: false },
            mailbox: "INBOX", // mailbox to monitor
            searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
            markSeen: true, // all fetched email willbe marked as seen and not fetched next time
            fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
            mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
            attachments: true, // download attachments as they are encountered to the project directory
            attachmentOptions: { directory: "temp/attachments" } // specify a download directory for attachments
        });
        let _handler = this.handler;
        if(typeof mailOptions.handler !== 'undefined'){
            this.handler = mailOptions.handler;
            _handler = this.handler;
        }

        this.mailListener.on("server:connected", function(){
            console.log("imapConnected");
        });
           
        this.mailListener.on("server:disconnected", function(){
            console.log("imapDisconnected");
        });
           
        this.mailListener.on("error", function(err){
            console.log(err);
        });
           
        this.mailListener.on("mail", function(mail, seqno, attributes){
            if(_handler != null )
                _handler(mail.headers.from, mail.headers.subject, mail.text);
        });
           
        this.mailListener.on("attachment", function(attachment){
            console.log(attachment.path);
        });

        this.mailListener.start();
    }
};
module.exports = emailReceiver;