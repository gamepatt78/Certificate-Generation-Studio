const nodemailer = require('nodemailer');

const sendAcceptanceEmail = async (userEmail, fullName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: 'Standard Operating Procedure - Acceptance Confirmation',
      text: `Dear ${fullName},\n\nThis email confirms that you have successfully reviewed and accepted the Standard Operating Procedure (SOP).\n\nThank you,\nManagement Team`,
      html: `<p>Dear ${fullName},</p><p>This email confirms that you have successfully reviewed and accepted the Standard Operating Procedure (SOP).</p><p>Thank you,<br>Management Team</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${userEmail}: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error);
    throw error;
  }
};

module.exports = {
  sendAcceptanceEmail,
};
