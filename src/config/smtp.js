const nodemailer = require("nodemailer");

// Validate required SMTP env vars at startup
const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.warn(`[SMTP] Missing env vars: ${missing.join(", ")}. Contact form emails will fail.`);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

module.exports = { transporter };
