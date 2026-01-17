import { Issue } from "../models/issue.model.js";
import transporter from "../config/nodemailer.js";
import { ENV } from "../config/env.js";
import {
  issueCreatedUserTemplate,
  issueCreatedAdminTemplate,
  issueResolvedUserTemplate,
} from "../lib/emailTemplates.js";

// Create a new issue
export async function createIssue(req, res) {
  try {
    const { type, subject, description, userEmail, userName } = req.body;
    const user = req.user;

    // Validate required fields
    if (!type || !subject || !description || !userEmail || !userName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create the issue
    const issue = await Issue.create({
      user: user?._id || null,
      clerkId: user?.clerkId || null,
      type,
      subject,
      description,
      userEmail,
      userName,
    });

    console.log("\n=== New Issue Created ===");
    console.log("Ticket Number:", issue.ticketNumber);
    console.log("Type:", issue.type);
    console.log("User:", userName);
    console.log("=========================\n");

    // Send confirmation email to user
    try {
      const userEmailTemplate = issueCreatedUserTemplate(issue);
      await transporter.sendMail({
        from: `"ShopKart Support" <${ENV.EMAIL_USER}>`,
        to: userEmail,
        subject: userEmailTemplate.subject,
        html: userEmailTemplate.html,
      });
      console.log("✅ Email sent to user:", userEmail);
    } catch (emailError) {
      console.error("❌ Failed to send user email:", emailError.message);
    }

    // Send notification email to admin
    try {
      const adminEmailTemplate = issueCreatedAdminTemplate(issue);
      await transporter.sendMail({
        from: `"ShopKart System" <${ENV.EMAIL_USER}>`,
        to: ENV.ADMIN_EMAIL,
        subject: adminEmailTemplate.subject,
        html: adminEmailTemplate.html,
      });
      console.log("✅ Email sent to admin:", ENV.ADMIN_EMAIL);
    } catch (emailError) {
      console.error("❌ Failed to send admin email:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Issue submitted successfully",
      issue,
    });
  } catch (error) {
    console.error("Error in createIssue:", error);
    res.status(500).json({ error: "Failed to submit issue" });
  }
}

// Get all issues (Admin only)
export async function getAllIssues(req, res) {
  try {
    const { status, type } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const issues = await Issue.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Error in getAllIssues:", error);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
}

// Get issue by ID (Admin only)
export async function getIssueById(req, res) {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.status(200).json({ success: true, issue });
  } catch (error) {
    console.error("Error in getIssueById:", error);
    res.status(500).json({ error: "Failed to fetch issue" });
  }
}

// Mark issue as resolved (Admin only)
export async function markIssueResolved(req, res) {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    if (issue.status === "resolved") {
      return res.status(400).json({ error: "Issue already resolved" });
    }

    // Update status
    issue.status = "resolved";
    issue.resolvedAt = new Date();
    await issue.save();

    console.log("\n=== Issue Resolved ===");
    console.log("Ticket:", issue.ticketNumber);
    console.log("======================\n");

    // Send resolution email to user
    try {
      const resolvedEmailTemplate = issueResolvedUserTemplate(issue);
      await transporter.sendMail({
        from: `"ShopKart Support" <${ENV.EMAIL_USER}>`,
        to: issue.userEmail,
        subject: resolvedEmailTemplate.subject,
        html: resolvedEmailTemplate.html,
      });
      console.log("✅ Resolution email sent to user:", issue.userEmail);
    } catch (emailError) {
      console.error("❌ Failed to send resolution email:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: "Issue marked as resolved",
      issue,
    });
  } catch (error) {
    console.error("Error in markIssueResolved:", error);
    res.status(500).json({ error: "Failed to resolve issue" });
  }
}