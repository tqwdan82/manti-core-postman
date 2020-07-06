const nodemailer = require('../lib/node_modules/nodemailer');

// {   // encoded string as an attachment
//     filename: 'text1.txt',
//     content: 'aGVsbG8gd29ybGQh',
//     encoding: 'base64'
// },
let emailSender = {
    send: function(email){
        let transporter = nodemailer.createTransport({
            host: email.mailOptions.server.host,
            port: email.mailOptions.server.port,
            auth: {
                user: email.mailOptions.server.user,
                pass: email.mailOptions.server.pass
            }
        });

        let mail = {
            from: email.from,
            to: email.to,
            subject: email.subject,
        };

        if(email.mailOptions.contentIsHtml){
            mail.html = email.content;
        }else{
            mail.text = email.content;
        }

        if(email.attachments !== null 
            && typeof email.attachments !== 'undefined'){ // if there is attachments
            mail.attachments = email.attachments;
        }

        transporter.sendMail(mail, function(error, info){
            if (error) {
              throw "Email cannot be sent. Error: " + error
            } else {
              console.log('Email sent: ' + info.response);
            }
        });
    }
};
module.exports = emailSender;