const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const appendFile = promisify(fs.appendFile);
const readFile = promisify(fs.readFile);

// CSV file path on remote server
// const CSV_FILE_PATH = '/home/developer/workspace/inji-certify/docker-compose/docker-compose-injistack/config/driving_license_data.csv';
const CSV_FILE_PATH = 'D:/vlinder/COJ/Inji/driving_license_data.csv';

// Static grant information
const GRANT_INFO = {
  grantName: 'Invia Social Grant',
  grantAmount: 'INV 80000',
  grantType: 'Social Welfare',
  grantDescription: 'Invia Social Grant Credential provides a secure verifiable digital proof of an individual\'s eligibility for government social-benefit programs',
  issuerName: 'Government of Invia',
};

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Generate validity dates
 */
const generateValidityDates = () => {
  const issuanceDate = new Date();
  const validityStartDate = new Date(issuanceDate);
  const validityEndDate = new Date(issuanceDate);
  validityEndDate.setFullYear(validityEndDate.getFullYear() + 1); // Valid for 1 year

  return {
    issuanceDate: formatDate(issuanceDate),
    validityStartDate: formatDate(validityStartDate),
    validityEndDate: formatDate(validityEndDate),
  };
};

/**
 * Check if individual ID already exists in CSV
 */
const isIndividualIdExists = async (individualId) => {
  try {
    const fileContent = await readFile(CSV_FILE_PATH, 'utf8');
    const lines = fileContent.split('\n');
    
    // Skip header and check if individualId exists
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && line.startsWith(individualId + ',')) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking CSV:', error);
    return false;
  }
};

/**
 * Append application data to CSV file
 */
const appendToCSV = async (applicationData) => {
  try {
    const { nationalId, fullName } = applicationData;

    // Check if already exists
    const exists = await isIndividualIdExists(nationalId);
    if (exists) {
      console.log(`Individual ID ${nationalId} already exists in CSV. Skipping append.`);
      return {
        success: true,
        message: 'Credential already exists',
        alreadyExists: true,
      };
    }

    // Generate dates
    const { issuanceDate, validityStartDate, validityEndDate } = generateValidityDates();

    // Create CSV row
    const csvRow = [
      nationalId,                      // individualId
      fullName,                        // beneficiaryName
      GRANT_INFO.grantName,           // grantName
      GRANT_INFO.grantAmount,         // grantAmount
      GRANT_INFO.grantType,           // grantType
      GRANT_INFO.grantDescription,    // grantDescription
      GRANT_INFO.issuerName,          // issuerName
      validityStartDate,              // validityStartDate
      validityEndDate,                // validityEndDate
      issuanceDate,                   // issuanceDate
    ].join(',');

    // Append to CSV file
    await appendFile(CSV_FILE_PATH, '\n' + csvRow);

    console.log(`✅ Successfully added ${fullName} (${nationalId}) to CSV`);

    return {
      success: true,
      message: 'Credential data added successfully',
      data: {
        individualId: nationalId,
        beneficiaryName: fullName,
        issuanceDate,
        validityStartDate,
        validityEndDate,
      },
    };
  } catch (error) {
    console.error('❌ Error appending to CSV:', error);
    throw new Error(`Failed to update credential data: ${error.message}`);
  }
};

/**
 * Get credential info for an individual
 */
const getCredentialInfo = async (individualId) => {
  try {
    const fileContent = await readFile(CSV_FILE_PATH, 'utf8');
    const lines = fileContent.split('\n');
    
    // Find the row with matching individualId
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && line.startsWith(individualId + ',')) {
        const fields = line.split(',');
        return {
          individualId: fields[0],
          beneficiaryName: fields[1],
          grantName: fields[2],
          grantAmount: fields[3],
          grantType: fields[4],
          validityStartDate: fields[7],
          validityEndDate: fields[8],
          issuanceDate: fields[9],
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading CSV:', error);
    return null;
  }
};

module.exports = {
  appendToCSV,
  getCredentialInfo,
  isIndividualIdExists,
};