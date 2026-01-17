import nodemailer from "nodemailer";
import { ENV } from "./env.js";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or your preferred email service
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASS, // Use App Password for Gmail
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

export default transporter;