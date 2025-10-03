// Reasoning: Centralized mailer setup using Nodemailer; credentials from env
const nodemailer = require('nodemailer');
const config = require('./index');
const logger = require('./logger');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: config.SMTP.host,
    port: config.SMTP.port,
    secure: config.SMTP.secure,
    auth: config.SMTP.user && config.SMTP.pass ? { user: config.SMTP.user, pass: config.SMTP.pass } : undefined,
  });
  return transporter;
}

async function sendMail({ to, subject, text, html, attachments }) {
  const tx = getTransporter();
  const info = await tx.sendMail({ from: config.SMTP.from, to, subject, text, html, attachments });
  logger.info('Email sent: %s', info.messageId);
  return info;
}

module.exports = { sendMail };
