const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  houseBuilding: {
    type: String,
    required: [true, 'House/Building is required'],
    trim: true,
  },
  streetRoadLane: {
    type: String,
    required: [true, 'Street/Road/Lane is required'],
    trim: true,
  },
  areaLocality: {
    type: String,
    required: [true, 'Area/Locality is required'],
    trim: true,
  },
  villageTownCity: {
    type: String,
    required: [true, 'Village/Town/City is required'],
    trim: true,
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode'],
  },
});

const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const applicationSchema = new mongoose.Schema(
  {
    // Application Reference Number (auto-generated)
    applicationId: {
      type: String,
      unique: true,
    },

    // Personal Information
    nationalId: {
      type: String,
      required: [true, 'National ID is required'],
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full Name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: String,
      required: [true, 'Date of Birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile Number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    // Address Information
    address: {
      type: addressSchema,
      required: true,
    },

    // Document
    addressProof: {
      type: documentSchema,
      required: true,
    },

    // Grant Amount
    grantAmount: {
      type: String,
      default: 'INV 50000',
    },
    // Application Status
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
      default: 'Pending',
    },

    // Status History
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        remarks: String,
        changedBy: String,
      },
    ],

    // Metadata
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate middleware to generate applicationId
applicationSchema.pre('validate', async function (next) {
  if (this.isNew && !this.applicationId) {
    const count = await mongoose.model('Application').countDocuments();
    const year = new Date().getFullYear();
    this.applicationId = `SG-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to add status history
applicationSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Add initial status to history
    this.statusHistory.push({
      status: 'Pending',
      remarks: 'Application submitted',
      changedBy: 'System',
    });
  }
  this.lastUpdatedAt = new Date();
  next();
});

// Index for faster queries
applicationSchema.index({ applicationId: 1 });
applicationSchema.index({ nationalId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ submittedAt: -1 });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;