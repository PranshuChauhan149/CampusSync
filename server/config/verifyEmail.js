import nodemailer from "nodemailer";

const getEmailConfig = () => {
  const EMAIL_USER = process.env.EMAIL_USER || process.env.MAIL_USER;
  const rawPass = process.env.EMAIL_PASS || process.env.MAIL_PASSWORD;
  const EMAIL_PASS = rawPass ? rawPass.replace(/\s+/g, "") : rawPass;
  const EMAIL_FROM = process.env.EMAIL_FROM || process.env.MAIL_FROM || EMAIL_USER;

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Email credentials not configured. Set EMAIL_USER/EMAIL_PASS or MAIL_USER/MAIL_PASSWORD in .env");
  }

  return { EMAIL_USER, EMAIL_PASS, EMAIL_FROM };
};

const createTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = getEmailConfig();

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

export const sendOTPEmail = async (otp, email) => {
  try {
    console.log('Attempting to send OTP email to:', email);
    const transporter = createTransporter();

    const mailConfiguration = {
      from: getEmailConfig().EMAIL_FROM,
      to: email,
      subject: "Email Verification OTP - CampusSync",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #3b82f6; text-align: center;">CampusSync Email Verification</h2>
        <p style="color: #666; text-align: center; margin-bottom: 20px;">Your OTP for email verification is:</p>
        <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">This OTP is valid for 10 minutes. Do not share this OTP with anyone.</p>
        <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    };

    const result = await transporter.sendMail(mailConfiguration);
    console.log('OTP email sent successfully to:', email, 'MessageID:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending OTP email to:', email);
    console.error('Error details:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

export const verifyMail = async (token, email) => {
  try {
    console.log('Attempting to send verification email to:', email);
    const transporter = createTransporter();

    const mailConfiguration = {
      from: getEmailConfig().EMAIL_FROM,
      to: email,
      subject: "Email verification",
      html: `<h1>Email Verification</h1>
           <p>Click the link below to verify your email</p>
           <a href="${process.env.CLIENT_URL}/verify-email?token=${token}">
             Verify Email
           </a>`,
    };

    const result = await transporter.sendMail(mailConfiguration);
    console.log('Verification email sent successfully to:', email, 'MessageID:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending verification email to:', email);
    console.error('Error details:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

