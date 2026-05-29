const nodemailer = require("nodemailer");

module.exports = async function sendEmail({ to, subject, html }) {
  const t = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, port: Number(process.env.EMAIL_PORT),
    secure: false, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await t.sendMail({ from: `"ResumeForge" <${process.env.EMAIL_USER}>`, to, subject, html });
};
