import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (otp, email) => {
  try {
    console.log('Attempting to send OTP email to:', email);

    const result = await resend.emails.send({
      from: "CampusSync <noreply@resend.dev>",
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
    });

    console.log('OTP email sent successfully to:', email, 'ID:', result.id);
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

    const result = await resend.emails.send({
      from: "CampusSync <noreply@resend.dev>",
      to: email,
      subject: "Email verification",
      html: `<h1>Email Verification</h1>
           <p>Click the link below to verify your email</p>
           <a href="${process.env.CLIENT_URL}/verify-email?token=${token}">
             Verify Email
           </a>`,
    });

    console.log('Verification email sent successfully to:', email, 'ID:', result.id);
    return result;
  } catch (error) {
    console.error('Error sending verification email to:', email);
    console.error('Error details:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

