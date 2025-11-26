const Application = require('../models/Application');
const path = require('path');
const fs = require('fs');
const { appendToCSV, getCredentialInfo } = require('../services/csvService');
const { sendApprovalEmail } = require('../services/emailService');
const { sendPurchaseConfirmationEmail } = require('../services/emailService');

// @desc    Submit new application
// @route   POST /api/applications
// @access  Public
const submitApplication = async (req, res) => {
  try {
    const {
      nationalId,
      fullName,
      dateOfBirth,
      gender,
      mobileNumber,
      email,
      houseBuilding,
      streetRoadLane,
      areaLocality,
      villageTownCity,
      district,
      state,
      pincode,
    } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Address proof document is required',
      });
    }

    // Check for existing application with same nationalId (optional - remove if multiple applications allowed)
    const existingApplication = await Application.findOne({
      nationalId,
      status: { $in: ['Pending', 'Under Review'] },
    });

    if (existingApplication) {
      // Remove uploaded file since we're rejecting
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'You already have a pending application',
        applicationId: existingApplication.applicationId,
      });
    }

    // Create application
    const application = new Application({
      nationalId,
      fullName,
      dateOfBirth,
      gender,
      mobileNumber,
      email,
      address: {
        houseBuilding,
        streetRoadLane,
        areaLocality,
        villageTownCity,
        district,
        state,
        pincode,
      },
      addressProof: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      },
      grantAmount: 'INV 50000',
    });

    await application.save();

    // 🔥 Step 1: Append to CSV file
    let csvResult = null;
    try {
      csvResult = await appendToCSV({
        nationalId,
        fullName,
      });
      console.log('CSV Update Result:', csvResult);
    } catch (csvError) {
      console.error('CSV update failed:', csvError);
      // Continue even if CSV fails - don't block application submission
    }

    // 🔥 Step 2: Get credential info
    let credentialInfo = null;
    if (csvResult?.success) {
      credentialInfo = await getCredentialInfo(nationalId);
    }

    // 🔥 Step 3: Send approval email
    try {
      await sendApprovalEmail({
        email,
        fullName,
        applicationId: application.applicationId,
        nationalId,
        credentialInfo,
      });
      console.log('✅ Approval email sent to:', email);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application.applicationId,
        status: application.status,
        submittedAt: application.submittedAt,
        credentialReady: csvResult?.success || false,
        emailSent: true, // Assuming email was attempted
      },
    });
  } catch (error) {
    console.error('Submit Application Error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message,
    });
  }
};

// @desc    Get application by ID
// @route   GET /api/applications/:applicationId
// @access  Public
const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findOne({ applicationId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Get Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message,
    });
  }
};

// @desc    Get applications by National ID
// @route   GET /api/applications/user/:nationalId
// @access  Public
const getApplicationsByNationalId = async (req, res) => {
  try {
    const { nationalId } = req.params;

    const applications = await Application.find({ nationalId })
      .select('applicationId fullName status submittedAt lastUpdatedAt')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message,
    });
  }
};

// @desc    Get all applications (Admin)
// @route   GET /api/applications
// @access  Admin
const getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .select('applicationId fullName nationalId status submittedAt')
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: applications,
    });
  } catch (error) {
    console.error('Get All Applications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message,
    });
  }
};

// @desc    Update application status (Admin)
// @route   PATCH /api/applications/:applicationId/status
// @access  Admin
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, remarks, changedBy = 'Admin' } = req.body;

    const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const application = await Application.findOne({ applicationId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      remarks,
      changedBy,
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      data: {
        applicationId: application.applicationId,
        status: application.status,
        lastUpdatedAt: application.lastUpdatedAt,
      },
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    });
  }
};

/**
 * @desc    Confirm purchase and send confirmation email
 * @route   POST /api/applications/purchase/confirm
 * @access  Public
 */
const confirmPurchase = async (req, res) => {
  try {
    const { grantId, transactionId, productName, amountDeducted, remainingBalance, currency } = req.body;

    // Validate required fields
    if (!grantId || !transactionId || !productName || !amountDeducted || remainingBalance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    console.log(`🔍 Looking up application with grant ID: ${grantId}`);

    // Find application by grantId (which is applicationId)
    const application = await Application.findOne({ nationalId: grantId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    console.log(`✅ Application found: ${application.email}`);

    // Update application status history
    application.statusHistory.push({
      status: 'Purchase Completed',
      remarks: `Purchase confirmed - Product: ${productName}, Amount: ${currency}${amountDeducted}, Transaction: ${transactionId}`,
      changedBy: 'System',
    });

    // Update grant amount (deduct purchase amount)
    const currentBalance = parseFloat(application.grantAmount.replace(/[^\d.]/g, '')) || 0;
    const newBalance = currentBalance - amountDeducted;
    application.grantAmount = `${currency}${newBalance}`;

    // Save updated application
    await application.save();
    console.log(`✅ Application updated with new balance: ${application.grantAmount}`);

    // Send purchase confirmation email
    try {
      await sendPurchaseConfirmationEmail({
        email: application.email,
        fullName: application.fullName,
        transactionId,
        productName,
        amountDeducted,
        remainingBalance,
        currency: currency || 'INV ',
        purchaseDate: new Date(),
      });
      console.log('✅ Purchase confirmation email sent');
    } catch (emailError) {
      console.error('⚠️  Email sending failed (non-blocking):', emailError);
      // Don't fail the purchase if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Purchase confirmed and confirmation email sent',
      data: {
        applicationId: application.applicationId,
        transactionId,
        email: application.email,
        newBalance: application.grantAmount,
        confirmationEmailSent: true,
      },
    });
  } catch (error) {
    console.error('❌ Confirm Purchase Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm purchase',
      error: error.message,
    });
  }
};

module.exports = {
  submitApplication,
  getApplicationById,
  getApplicationsByNationalId,
  getAllApplications,
  updateApplicationStatus,
  confirmPurchase,
};