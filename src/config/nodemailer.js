import nodemailer from "nodemailer";
import { ENV } from "./env.js";

// Create transporter with better configuration for hosting environments
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465, // Use secure port 465 instead of 587
  secure: true, // Use SSL
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASS, // Use App Password for Gmail
  },
  tls: {
    rejectUnauthorized: false, // Important for some hosting providers
  },
  // Add connection timeout and socket timeout
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify connection with better error handling
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error.message);
    console.log("💡 Make sure you're using a Gmail App Password");
    console.log("💡 Generate one at: https://myaccount.google.com/apppasswords");
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

export default transporter;