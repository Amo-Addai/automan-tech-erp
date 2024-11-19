const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "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");
const msg = {
  to: ['kwadwoamoad@gmail.com', 'kwadwo.amo-addai@meltwater.org'],
  from: '[SAMPLE_COMPANY] Real Estate Investments <invest@[SAMPLE_COMPANY].com>',
  subject: 'Sample Email via Twilio SendGrid',
  text: 'Sending a sample email via Twilio SendGrid with Node.js',
  html: '<strong>Sending a sample email via Twilio SendGrid with Node.js</strong>',
  template: ''
};
sgMail.sendMultiple(msg);