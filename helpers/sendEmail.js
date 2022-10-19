const { EMAIL_PORT, EMAIL_HOST, EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_FROM } = require("../helpers/constant")
const hbs = require('nodemailer-express-handlebars')
const nodemailer = require('nodemailer')
const path = require('path')

 // initialize nodemailer
 var transporter = nodemailer.createTransport(
  {
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD
    }
  }
);

const mail = (mailOptions)=>{
  transporter.sendMail(mailOptions, function (error, response) {
    if (error) {
      return error;
    }
    transporter.close(); // shut down the connection pool, no more messages
    return response;
  });
}

// point to the template folder
const handlebarOptions = {
  viewEngine: {
    partialsDir: path.resolve('./views/'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./views/'),
};

const sendEmail = async options => {
 
  // use a template file with nodemailer
  transporter.use('compile', hbs(handlebarOptions))

  var mailOptions = {
    from: EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    template: 'email', // the name of the template file i.e email.handlebars
    context: {
      link: options.link,
    }
  };

 mail(mailOptions);
};


const emailPassword = async options => {

// use a template file with nodemailer
transporter.use('compile', hbs(handlebarOptions))

  const mailOptions = {
    from:EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    template: 'resetPassword', // the name of the template file i.e email.handlebars
    context: {
      password: options.message,
    }
  };


  mail(mailOptions);
};

module.exports = {sendEmail,emailPassword };

