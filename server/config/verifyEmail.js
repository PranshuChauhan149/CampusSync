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

export const sendItemNotificationEmail = async (email, item) => {
  try {
    console.log('Attempting to send item notification email to:', email);
    const transporter = createTransporter();

  const itemType = item.type === 'lost' ? 'Lost' : 'Found';
  const itemDate = new Date(item.date).toLocaleDateString();

  const mailConfiguration = {
    from: getEmailConfig().EMAIL_FROM,
    to: email,
    subject: `New ${itemType} Item Reported - CampusSync`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #3b82f6; text-align: center;">CampusSync - New ${itemType} Item Alert</h2>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #333; margin-top: 0;">${item.title}</h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
            <div><strong>Type:</strong> ${itemType}</div>
            <div><strong>Category:</strong> ${item.category}</div>
            <div><strong>Location:</strong> ${item.location}</div>
            <div><strong>Date:</strong> ${itemDate}</div>
          </div>

          <div style="margin: 15px 0;">
            <strong>Description:</strong>
            <p style="margin: 5px 0; color: #666;">${item.description}</p>
          </div>

          ${item.tags && item.tags.length > 0 ? `
            <div style="margin: 15px 0;">
              <strong>Tags:</strong>
              <div style="margin-top: 5px;">
                ${item.tags.map(tag => `<span style="background-color: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px;">${tag}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${item.images && item.images.length > 0 ? `
            <div style="margin: 15px 0;">
              <strong>Images:</strong>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">${item.images.length} image(s) attached</p>
            </div>
          ` : ''}

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <strong>Contact Information:</strong>
            <div style="margin-top: 5px;">
              <div><strong>Name:</strong> ${item.contactInfo.name}</div>
              <div><strong>Email:</strong> ${item.contactInfo.email}</div>
              ${item.contactInfo.phone ? `<div><strong>Phone:</strong> ${item.contactInfo.phone}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.CLIENT_URL}/lost-found"
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Item Details
          </a>
        </div>

        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          You're receiving this notification because you're registered with CampusSync.
          <br>
          To manage your notification preferences, visit your account settings.
        </p>
      </div>
    `,
  };

    const result = await transporter.sendMail(mailConfiguration);
    console.log('Item notification email sent successfully to:', email, 'MessageID:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending item notification email to:', email);
    console.error('Error details:', error.message);
    throw error;
  }
};

export const sendBookNotificationEmail = async (email, bookData) => {
  try {
    const transporter = createTransporter();

    const conditionColors = {
      new: '#4CAF50',
      excellent: '#8BC34A',
      good: '#FFC107',
      fair: '#FF9800',
      poor: '#F44336'
    };

    const mailConfiguration = {
      from: getEmailConfig().EMAIL_FROM,
      to: email,
      subject: `New Book Available - CampusSync`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #3b82f6; text-align: center;">CampusSync - New Book for Sale</h2>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0;">${bookData.bookTitle}</h3>
            <h4 style="color: #666; margin: 5px 0;">by ${bookData.author}</h4>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
              <div><strong>Subject:</strong> ${bookData.subject}</div>
              <div><strong>Price:</strong> <span style="color: #3b82f6; font-size: 18px; font-weight: bold;">$${bookData.price}</span></div>
              <div><strong>Condition:</strong> <span style="background-color: ${conditionColors[bookData.condition] || '#666'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${bookData.condition}</span></div>
              <div><strong>Seller:</strong> ${bookData.sellerName}</div>
            </div>

            ${bookData.course ? `
              <div style="margin: 15px 0;">
                <strong>Course:</strong> ${bookData.course}
              </div>
            ` : ''}

            ${bookData.description ? `
              <div style="margin: 15px 0;">
                <strong>Description:</strong>
                <p style="margin: 5px 0; color: #666;">${bookData.description}</p>
              </div>
            ` : ''}

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <strong>Contact the seller to purchase this book!</strong>
            </div>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.CLIENT_URL}/books"
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Browse Books for Sale
            </a>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            You're receiving this notification because you're registered with CampusSync.
            <br>
            To manage your notification preferences, visit your account settings.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailConfiguration);
    console.log(`Book notification email sent to ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error(`Error sending book notification email to ${email}:`, error.message);
    throw error;
  }
};

