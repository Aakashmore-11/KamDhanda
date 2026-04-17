const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOtpEmail = async (toEmail, otp, userName) => {
    const mailOptions = {
        from: `"KamDhanda" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Your KamDhanda Verification Code',
        html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#07070d;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
          <div style="padding:24px 32px;background:linear-gradient(135deg,#5828ff,#8b5cf6);">
              <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.04em;">KamDhanda</h1>
              <p style="margin:4px 0 0;font-size:13px;opacity:0.8;">Your Professional Hub</p>
          </div>
          <div style="padding:32px;">
              <p style="color:rgba(255,255,255,0.6);font-size:15px;margin-top:0;">Hi <strong style="color:#fff;">${userName}</strong>,</p>
              <p style="color:rgba(255,255,255,0.6);font-size:14px;">Use the OTP below to verify your email address. It expires in <strong style="color:#a78bfa;">10 minutes</strong>.</p>
              <div style="text-align:center;margin:28px 0;">
                  <div style="display:inline-block;background:rgba(88,40,255,0.15);border:2px solid rgba(88,40,255,0.4);border-radius:16px;padding:20px 40px;">
                      <span style="font-size:42px;font-weight:800;letter-spacing:0.15em;color:#fff;">${otp}</span>
                  </div>
              </div>
              <p style="color:rgba(255,255,255,0.35);font-size:12px;text-align:center;">If you did not request this code, please ignore this email.</p>
          </div>
          <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">© 2025 KamDhanda. All rights reserved.</p>
          </div>
        </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};

const sendApplicationStatusEmail = async (toEmail, subject, htmlContent) => {
    const mailOptions = {
        from: `"KamDhanda Hiring" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent
    };
    return transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendApplicationStatusEmail };
