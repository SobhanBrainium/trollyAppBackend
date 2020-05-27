import nodeMailer from "nodemailer"
import nodeMailerSmtpTransport from "nodemailer-smtp-transport"
import config from "../config"

module.exports = function(emailType) {
    const emailFrom = config.emailConfig.MAIL_USERNAME;
    const emailPass = config.emailConfig.MAIL_PASS;

    // define mail types
    var mailDict = {
        "userRegistrationMail" :{
            subject : "Welcome to Trolley",
            //html    : require('./welcomeUser'),
        },
        "forgotPasswordMail" :{
            subject : "Forgot Password",
            //html    : require('./forgotPasswordMail'),
        },
        "sendOTPdMail" :{
            subject : "OTP verification email",
            //html    : require('./otpVerificationMail'),
        },
        "resendOtpMail": {
            subject : "Resend OTP",
        }
    };


    var transporter = nodeMailer.createTransport(nodeMailerSmtpTransport({
        host: 'smtp.gmail.com',
        port    : 465,
        secure  : true,
        debug   : true,
        auth    : {
            user    : emailFrom,
            pass    : emailPass,
            // pass    : new Buffer(emailPass,'base64').toString('ascii'),
        },    
        maxMessages : 100,
        requireTLS : true,
    }));


    return function(to, data) {
        var self = {
            send: () => {
                var mailOption = {
                    from: emailFrom,
                    to: to,
                    subject: mailDict[emailType].subject,
                    // text: `Hello ${data.name}, please verify your studiolive account. Your verification code is ${data.otp}`
                };

                /** Temporary Email text */
                switch(emailType) {
                    case 'userRegistrationMail': 
                        mailOption.text = `Hello ${data.firstName}, welcome to Trolley.`
                        break;
                    case 'forgotPasswordMail': 
                        mailOption.text = `Hello ${data.firstName}, use ${data.forgotPasswordOtp} code to reset your password.`
                        break;
                    case 'resendOtpMail':
                        mailOption.text = `Hello ${data.firstName}, use ${data.otp} code to verify your account.`
                        break;
                }
 

                transporter.sendMail(mailOption, function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email Sent', info.response);
                    }
                });
            }
        }
        return self;
    }
}

