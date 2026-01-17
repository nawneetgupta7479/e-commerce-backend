import nodemailer from "nodemailer";
import { ENV } from "./env.js";

// Function to create a fresh transporter for each email
export const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Send email function - creates fresh transporter each time
export const sendEmail = async (mailOptions) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter before sending
    await transporter.verify();
    
    // Send the email
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    return { success: false, error: error.message };
  }
};

export default { createTransporter, sendEmail };