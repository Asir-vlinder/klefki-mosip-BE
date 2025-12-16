// // method to check non-empty and non-null
// // values, if present then give default value
// const checkEmptyNullValue = (initialValue, defaultValue) =>
//     initialValue || defaultValue;

// const generateRandomString = (strLength = 16) => {
//     let result = "";
//     const characters = "abcdefghijklmnopqrstuvwxyz0123456789";

//     for (let i = 0; i < strLength; i++) {
//         const randomInd = Math.floor(Math.random() * characters.length);
//         result += characters.charAt(randomInd);
//     }
//     return result;
// };

// const state = generateRandomString(10);
// const nonce = generateRandomString();
// const responseType = "code";
// const scopeUserProfile = checkEmptyNullValue(
//     process.env.SCOPE_USER_PROFILE,
//     "openid profile",
// );
// const scopeRegistration = checkEmptyNullValue(
//     process.env.SCOPE_REGISTRATION,
//     "openid profile",
// );
// const display = checkEmptyNullValue(process.env.DISPLAY, "page");
// const prompt = checkEmptyNullValue(process.env.PROMPT, "consent");
// const grantType = checkEmptyNullValue(
//     process.env.GRANT_TYPE,
//     "authorization_code",
// );
// const maxAge = process.env.MAX_AGE;
// const claimsLocales = checkEmptyNullValue(process.env.CLAIMS_LOCALES, "en");
// const redirectUriUserprofile = checkEmptyNullValue(
//     process.env.REDIRECT_URI_USER_PROFILE,
//     process.env.REDIRECT_URI,
// );
// const redirectUriRegistration = checkEmptyNullValue(
//     process.env.REDIRECT_URI_REGISTRATION,
//     process.env.REDIRECT_URI,
// );
// const acrValues = process.env.ACRS;
// const userProfileClaims = checkEmptyNullValue(
//     process.env.CLAIMS_USER_PROFILE,
//     "{}",
// );
// const registrationClaims = checkEmptyNullValue(
//     process.env.CLAIMS_REGISTRATION,
//     "{}",
// );

// const clientDetails = {
//     nonce,
//     state,
//     scopeUserProfile,
//     scopeRegistration,
//     responseType,
//     redirectUriUserprofile,
//     redirectUriRegistration,
//     display,
//     prompt,
//     acrValues,
//     claimsLocales,
//     maxAge,
//     grantType,
//     parEndpoint: process.env.ESIGNET_PAR_ENDPOINT,
//     userProfileClaims,
//     registrationClaims,
// };

// module.exports = clientDetails;

// clientDetails.js
const checkEmptyNullValue = (initialValue, defaultValue) =>
    initialValue || defaultValue;

const generateRandomString = (strLength = 16) => {
    let result = "";
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < strLength; i++) {
        const randomInd = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomInd);
    }
    return result;
};

const state = generateRandomString(10);
const nonce = generateRandomString();
const responseType = "code";

// UPDATED: Proper scope with all required scopes
const scopeUserProfile = checkEmptyNullValue(
    process.env.SCOPE_USER_PROFILE,
    "openid profile email phone address",  // ← Changed
);

const scopeRegistration = checkEmptyNullValue(
    process.env.SCOPE_REGISTRATION,
    "openid profile email phone address",  // ← Changed
);

const display = checkEmptyNullValue(process.env.DISPLAY, "page");
const prompt = checkEmptyNullValue(process.env.PROMPT, "consent");
const grantType = checkEmptyNullValue(
    process.env.GRANT_TYPE,
    "authorization_code",
);
const maxAge = process.env.MAX_AGE;
const claimsLocales = checkEmptyNullValue(process.env.CLAIMS_LOCALES, "en");
const redirectUriUserprofile = checkEmptyNullValue(
    process.env.REDIRECT_URI_USER_PROFILE,
    "https://e-governance.klefki.io/apply-for-social-grant",  // ← Make sure this matches
);
const redirectUriRegistration = checkEmptyNullValue(
    process.env.REDIRECT_URI_REGISTRATION,
    "https://e-governance.klefki.io/apply-for-social-grant",  // ← Make sure this matches
);
const acrValues = process.env.ACRS;

// UPDATED: Proper claims request instead of empty object
const userProfileClaims = checkEmptyNullValue(
    process.env.CLAIMS_USER_PROFILE,
    JSON.stringify({
        userinfo: {
            individual_id: { essential: true },
            name: { essential: true },
            email: { essential: true },
            phone_number: { essential: true },
            birthdate: { essential: true },
            gender: { essential: true },
            address: { essential: false },
            picture: { essential: false }
        }
    })
);

const registrationClaims = checkEmptyNullValue(
    process.env.CLAIMS_REGISTRATION,
    JSON.stringify({
        userinfo: {
            name: { essential: true },
            email: { essential: true },
            phone_number: { essential: true },
            birthdate: { essential: true },
            gender: { essential: true }
        }
    })
);

const clientDetails = {
    nonce,
    state,
    scopeUserProfile,
    scopeRegistration,
    responseType,
    redirectUriUserprofile,
    redirectUriRegistration,
    display,
    prompt,
    acrValues,
    claimsLocales,
    maxAge,
    grantType,
    parEndpoint: process.env.ESIGNET_PAR_ENDPOINT || "https://mosip-dev.klefki.io/v1/esignet/oauth/v2/par",  // ← Added
    userProfileClaims,
    registrationClaims,
};

module.exports = clientDetails;