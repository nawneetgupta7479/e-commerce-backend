// User confirmation email when issue is created
export const issueCreatedUserTemplate = (issue) => {
  const typeLabels = {
    order: "Order Issue",
    payment: "Payment Issue",
    delivery: "Delivery Issue",
    product: "Product Issue",
    account: "Account Issue",
    other: "Other",
  };

  return {
    subject: `Issue Received - ${issue.ticketNumber} | ShopKart Support`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7fa;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">ShopKart</h1>
              <p style="color: #93C5FD; margin: 10px 0 0; font-size: 14px;">Customer Support</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1E293B; margin: 0 0 20px; font-size: 24px;">We've Received Your Issue</h2>
              
              <p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                Hi <strong style="color: #1E293B;">${issue.userName}</strong>,
              </p>
              
              <p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                Thank you for reaching out. We've received your support request and our team will get back to you within <strong>24-48 hours</strong>.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F1F5F9; border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #64748B; font-size: 14px;">Ticket Number</span>
                          <p style="color: #3B82F6; font-size: 20px; font-weight: 700; margin: 5px 0 0;">${issue.ticketNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #E2E8F0;">
                          <span style="color: #64748B; font-size: 14px;">Type</span>
                          <p style="color: #1E293B; font-size: 16px; font-weight: 600; margin: 5px 0 0;">${typeLabels[issue.type]}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #E2E8F0;">
                          <span style="color: #64748B; font-size: 14px;">Subject</span>
                          <p style="color: #1E293B; font-size: 16px; font-weight: 600; margin: 5px 0 0;">${issue.subject}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #E2E8F0;">
                          <span style="color: #64748B; font-size: 14px;">Status</span>
                          <p style="margin: 5px 0 0;">
                            <span style="background-color: #FEF3C7; color: #D97706; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">Pending</span>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #F8FAFC; border-left: 4px solid #3B82F6; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #64748B; font-size: 12px; margin: 0 0 8px; text-transform: uppercase;">Your Message</p>
                <p style="color: #1E293B; font-size: 14px; line-height: 1.6; margin: 0;">${issue.description}</p>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #F8FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #64748B; font-size: 14px; margin: 0 0 10px;">Need help?</p>
              <p style="color: #3B82F6; font-size: 14px; margin: 0;">support@shopkart.com</p>
              <p style="color: #94A3B8; font-size: 12px; margin: 20px 0 0;">© ${new Date().getFullYear()} ShopKart. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
};

// Admin notification email
export const issueCreatedAdminTemplate = (issue) => {
  const typeLabels = {
    order: "Order Issue",
    payment: "Payment Issue",
    delivery: "Delivery Issue",
    product: "Product Issue",
    account: "Account Issue",
    other: "Other",
  };

  return {
    subject: `🔔 New Support Ticket - ${issue.ticketNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7fa;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="background: linear-gradient(135deg, #1E293B 0%, #334155 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎫 New Support Ticket</h1>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #3B82F6; padding: 15px 30px;">
              <span style="color: #ffffff; font-size: 18px; font-weight: 700;">${issue.ticketNumber}</span>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: #F1F5F9; padding: 20px; border-radius: 10px;">
                    <h3 style="color: #1E293B; margin: 0 0 15px; font-size: 16px;">Customer Information</h3>
                    <p style="color: #64748B; margin: 5px 0;"><strong>Name:</strong> ${issue.userName}</p>
                    <p style="color: #64748B; margin: 5px 0;"><strong>Email:</strong> ${issue.userEmail}</p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 10px;">
                    <h3 style="color: #1E293B; margin: 0 0 15px; font-size: 16px;">Issue Details</h3>
                    <p style="color: #64748B; margin: 5px 0;"><strong>Type:</strong> ${typeLabels[issue.type]}</p>
                    <p style="color: #64748B; margin: 5px 0;"><strong>Subject:</strong> ${issue.subject}</p>
                    <p style="color: #64748B; margin: 10px 0 0;"><strong>Description:</strong></p>
                    <p style="color: #1E293B; margin: 5px 0; line-height: 1.6;">${issue.description}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #1E293B; padding: 20px; text-align: center;">
              <p style="color: #94A3B8; font-size: 12px; margin: 0;">ShopKart Admin Panel</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
};

// User email when issue is resolved
export const issueResolvedUserTemplate = (issue) => {
  return {
    subject: `✅ Issue Resolved - ${issue.ticketNumber} | ShopKart Support`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7fa;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Issue Resolved!</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                Hi <strong style="color: #1E293B;">${issue.userName}</strong>,
              </p>
              
              <p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                Great news! Your support ticket has been marked as <strong style="color: #10B981;">resolved</strong> by our team.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #64748B; font-size: 14px;">Ticket Number</span>
                          <p style="color: #10B981; font-size: 20px; font-weight: 700; margin: 5px 0 0;">${issue.ticketNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #BBF7D0;">
                          <span style="color: #64748B; font-size: 14px;">Subject</span>
                          <p style="color: #1E293B; font-size: 16px; font-weight: 600; margin: 5px 0 0;">${issue.subject}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #BBF7D0;">
                          <span style="color: #64748B; font-size: 14px;">Status</span>
                          <p style="margin: 5px 0 0;">
                            <span style="background-color: #10B981; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">Resolved</span>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 25px 0;">
                If you have any more questions, feel free to create a new support ticket.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                <tr>
                  <td style="text-align: center; padding: 20px; background-color: #F1F5F9; border-radius: 10px;">
                    <p style="color: #1E293B; font-size: 16px; font-weight: 600; margin: 0 0 5px;">Thank you for choosing ShopKart!</p>
                    <p style="color: #64748B; font-size: 14px; margin: 0;">We appreciate your patience.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #F8FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #64748B; font-size: 14px; margin: 0 0 10px;">Need more help?</p>
              <p style="color: #3B82F6; font-size: 14px; margin: 0;">support@shopkart.com</p>
              <p style="color: #94A3B8; font-size: 12px; margin: 20px 0 0;">© ${new Date().getFullYear()} ShopKart. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
};