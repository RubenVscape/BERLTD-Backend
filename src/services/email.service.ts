import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for 587
  auth: {
    user: "info@vescapelabs.com",
    pass: "YOUR_EMAIL_PASSWORD_OR_APP_PASSWORD", 
  },
});


