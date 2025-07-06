require('dotenv').config();

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create transporter is the protocal to sen the emails 
  const transporter = nodemailer.createTransport({
    service:'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  // 3) Send the email
  await transporter.sendMail(mailOptions,(error, info)=>{
    if(error){
      return console.log('Error occures:', error);
    }
    console.log('email sent successfully', info.response);
  });
};

module.exports = sendEmail;
