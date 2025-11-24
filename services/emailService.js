/*
 *   Copyright (c) 2021 vlinder Labs Private Limited
 *   All rights reserved.
 */
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Nexus Configuration
const NEXUS_CONFIG = {
  enabled: process.env.NEXUS_ENABLED === 'true',
  url: process.env.NEXUS_URL || 'https://api-nexus.vlinder.io/v1/mail/now',
  token: process.env.NEXUS_TOKEN,
  domainName: process.env.NEXUS_DOMAIN_NAME || 'mail.vlinder.io',
};

// Sender email configuration
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@vlinder.io';
const SENDER_NAME = process.env.SENDER_NAME || 'Invia Social Grants';

/**
 * Generate HTML email template
 */
const generateEmailTemplate = (data) => {
  const { fullName, applicationId, nationalId, credentialInfo } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f7fa;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
      color: white;
      padding: 25px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 25px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 20px 0;
    }
    .info-box {
      background-color: #E8F4FD;
      border-left: 4px solid #1E3A8A;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #ddd;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .info-value {
      color: #1E3A8A;
      font-weight: 600;
    }
    .cta-section {
      background: linear-gradient(135deg, #E8F4FD 0%, #DBEAFE 100%);
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
      text-align: center;
    }
    .cta-title {
      font-size: 18px;
      font-weight: 600;
      color: #1E3A8A;
      margin-bottom: 15px;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      margin: 8px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
    }
    .btn-primary {
      background-color: #1E3A8A;
      color: white;
    }
    .btn-secondary {
      background-color: #16A34A;
      color: white;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      color: #666;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
      margin-top: 30px;
    }
    .highlight {
      background-color: #FEF3C7;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">✅</div>
      <h1>Application Approved!</h1>
      <p style="margin: 5px 0 0; opacity: 0.9;">Your Social Grant has been successfully approved</p>
    </div>

    <div class="content">
      <p>Dear <strong>${fullName}</strong>,</p>
      
      <p>Congratulations! Your Social Grant application has been approved and your digital credential is now ready to download.</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Application ID:</span>
          <span class="info-value">${applicationId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Individual ID:</span>
          <span class="info-value">${nationalId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Grant Type:</span>
          <span class="info-value">${credentialInfo?.grantName || 'Invia Social Grant'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Grant Amount:</span>
          <span class="info-value">${credentialInfo?.grantAmount || 'INV 80000'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Valid From:</span>
          <span class="info-value">${credentialInfo?.validityStartDate || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Valid Until:</span>
          <span class="info-value">${credentialInfo?.validityEndDate || 'N/A'}</span>
        </div>
      </div>

      <div class="cta-section">
        <div class="cta-title">📱 Download Your Credential</div>
        <p>You can now download your Social Grant credential using the Inji Wallet:</p>
        
        <div>
          <a href="https://mosip-dev.klefki.io/inji" class="btn btn-secondary text-white" target="_blank">
            📲 Download Mobile App
          </a>
        </div>
        
        <p style="margin-top: 15px; font-size: 14px; color: #666;">
          Use your <span class="highlight">Individual ID: ${nationalId}</span> to download your credential
        </p>
      </div>

      <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <strong>⚠️ Important:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Keep your Individual ID secure</li>
          <li>Download your credential within 30 days</li>
          <li>Your credential is valid for 1 year from the issuance date</li>
        </ul>
      </div>

      <p>If you have any questions or need assistance, please contact our support team.</p>

      <p style="margin-top: 25px;">
        Best regards,<br>
        <strong>Government of Invia</strong><br>
        Social Welfare Department
      </p>
    </div>

    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>&copy; 2025 Government of Invia. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Send email via Nexus
 */
const sendViaNexttus = async (mailParams) => {
  try {
    console.log('📧 Sending email via Nexus...');

    const nexusParams = {
      ...mailParams,
      txn_id: uuidv4(),
      domain: NEXUS_CONFIG.domainName,
    };

    // Handle attachments if present
    if (mailParams.attachments && mailParams.attachments.length > 0) {
      nexusParams.attachments = mailParams.attachments[0];
    }

    const response = await axios.post(NEXUS_CONFIG.url, nexusParams, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${NEXUS_CONFIG.token}`,
      },
      timeout: 30000,
    });

    console.log('✅ Nexus email response:', response.data);

    return {
      success: true,
      messageId: nexusParams.txn_id,
      response: response.data,
    };
  } catch (error) {
    console.error('❌ Nexus email error:', error.response?.data || error.message);
    throw new Error(`Nexus email failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Send application approval email
 */
const sendApprovalEmail = async (emailData) => {
  try {
    const { email, fullName, applicationId, nationalId, credentialInfo } = emailData;

    console.log(`📧 Preparing to send approval email to: ${email}`);

    // Prepare mail parameters
    const mailParams = {
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [email],
      subject: '✅ Your Social Grant Application has been Approved!',
      html: generateEmailTemplate({
        fullName,
        applicationId,
        nationalId,
        credentialInfo,
      }),
      text: `Dear ${fullName},\n\nYour Social Grant application has been approved!\n\nApplication ID: ${applicationId}\nIndividual ID: ${nationalId}\n\nYou can now download your credential using the Inji Wallet.\n\nBest regards,\nGovernment of Invia`,
    };

    // Send via Nexus if enabled
    if (NEXUS_CONFIG.enabled && NEXUS_CONFIG.token) {
      const result = await sendViaNexttus(mailParams);
      console.log('✅ Email sent successfully via Nexus:', result.messageId);
      return result;
    } else {
      throw new Error('Nexus email service is not configured. Please set NEXUS_ENABLED=true and provide NEXUS_TOKEN in .env');
    }
  } catch (error) {
    console.error('❌ Error sending approval email:', error);
    throw error;
  }
};

/**
 * Send test email
 */
const sendTestEmail = async (toEmail) => {
  try {
    console.log(`📧 Sending test email to: ${toEmail}`);

    const mailParams = {
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [toEmail],
      subject: 'Test Email - Invia Social Grants',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #1E3A8A;">Test Email</h2>
          <p>This is a test email from the Invia Social Grants system.</p>
          <p>If you received this email, the email service is working correctly.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent via Nexus Email Service<br>
            Transaction ID: ${uuidv4()}
          </p>
        </div>
      `,
      text: 'This is a test email from the Invia Social Grants system.',
    };

    if (NEXUS_CONFIG.enabled && NEXUS_CONFIG.token) {
      const result = await sendViaNexttus(mailParams);
      console.log('✅ Test email sent successfully');
      return result;
    } else {
      throw new Error('Nexus email service is not configured');
    }
  } catch (error) {
    console.error('❌ Test email error:', error);
    throw error;
  }
};

/**
 * Verify email service configuration
 */
const verifyEmailConfig = () => {
  console.log('📧 Email Service Configuration:');
  console.log('  - Nexus Enabled:', NEXUS_CONFIG.enabled);
  console.log('  - Nexus URL:', NEXUS_CONFIG.url);
  console.log('  - Nexus Domain:', NEXUS_CONFIG.domainName);
  console.log('  - Nexus Token:', NEXUS_CONFIG.token ? '✅ Set' : '❌ Missing');
  console.log('  - Sender Email:', SENDER_EMAIL);

  if (!NEXUS_CONFIG.enabled) {
    console.warn('⚠️  WARNING: Nexus email service is disabled');
  }

  if (!NEXUS_CONFIG.token) {
    console.error('❌ ERROR: NEXUS_TOKEN is not set in environment variables');
  }
};

// Verify configuration on startup
verifyEmailConfig();

module.exports = {
  sendApprovalEmail,
  sendTestEmail,
  verifyEmailConfig,
};