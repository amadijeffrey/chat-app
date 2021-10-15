const nodemailer = require('nodemailer')

const sendEmail = options => {
  // create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      username: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD
    }
  })

  // define the mail options
  const mailOption = {
    from: 'chibuike amadi <amadichibuike72@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  }
  // send email
  transporter.sendEmail(mailOption)
}

module.exports = sendEmail
