const axios = require("axios");
const {
  decodeJwt,
  compactDecrypt,
  importJWK,
  SignJWT,
  importPKCS8,
} = require("jose");
const {
  ESIGNET_SERVICE_URL,
  ESIGNET_AUD_URL,
  ESIGNET_PAR_AUD_URL,
  CLIENT_ASSERTION_TYPE,
  CLIENT_PRIVATE_KEY,
  USERINFO_RESPONSE_TYPE,
  JWE_USERINFO_PRIVATE_KEY,
} = require("./config");

const clientDetails = require("./clientDetails");

const baseUrl = ESIGNET_SERVICE_URL.trim();
const getTokenEndPoint = "/oauth/v2/token";
const getUserInfoEndPoint = "/oidc/userinfo";

const alg = "RS256";
const jweEncryAlgo = "RSA-OAEP-256";
const expirationTime = "1h";

/**
 * Triggers /oauth/v2/token API on esignet service to fetch access token
 * @param {string} code auth code
 * @param {string} client_id registered client id
 * @param {string} redirect_uri validated redirect_uri
 * @param {string} grant_type grant_type
 * @returns access token
 */
const post_GetToken = async ({ code, client_id, redirect_uri, grant_type }) => {
  let request = new URLSearchParams({
    code: code,
    client_id: client_id,
    redirect_uri: redirect_uri,
    grant_type: grant_type,
    client_assertion_type: CLIENT_ASSERTION_TYPE,
    client_assertion: await generateSignedJwt(client_id, ESIGNET_AUD_URL),
  });
  const endpoint = baseUrl + getTokenEndPoint;
  const response = await axios.post(endpoint, request, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
};

/**
 * Triggers /oauth/par API on esignet service to fetch requestUri
 * @param {string} clientId clientId
 * @returns requestUri
 */
// const post_GetRequestUri = async (clientId, uiLocales, state) => {
//   const clientAssertion = await generateSignedJwt(
//     clientId,
//     ESIGNET_PAR_AUD_URL,
//   );
//   const params = new URLSearchParams();
//   params.append("nonce", clientDetails.nonce);
//   params.append("state", state || clientDetails.state);
//   params.append("client_id", clientId);
//   params.append("redirect_uri", clientDetails.redirectUriUserprofile);
//   params.append("scope", clientDetails.scopeUserProfile);
//   params.append("response_type", clientDetails.responseType);
//   params.append("acr_values", clientDetails.acrValues);
//   params.append("claims", clientDetails.userProfileClaims);
//   params.append("claims_locales", clientDetails.claimsLocales);
//   params.append("display", clientDetails.display);
//   params.append("prompt", clientDetails.prompt);
//   params.append("ui_locales", uiLocales || process.env.DEFAULT_UI_LOCALES);
//   params.append("client_assertion_type", CLIENT_ASSERTION_TYPE);
//   params.append("client_assertion", clientAssertion);
//   const response = await axios.post(clientDetails.parEndpoint, params.toString(), {
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//   });
//   return response.data;
// };

// const post_GetRequestUri = async (clientId, uiLocales, state) => {
//   const clientAssertion = await generateSignedJwt(
//     clientId,
//     ESIGNET_PAR_AUD_URL,
//   );
  
//   // Define the claims you want to request
//   const claimsRequest = {
//     userinfo: {
//       name: { essential: true },
//       email: { essential: true },
//       phone_number: { essential: true },
//       birthdate: { essential: true },
//       gender: { essential: true },
//       address: { essential: false },
//       picture: { essential: false }
//     }
//   };
  
//   const params = new URLSearchParams();
//   params.append("nonce", clientDetails.nonce);
//   params.append("state", state || clientDetails.state);
//   params.append("client_id", clientId);
//   params.append("redirect_uri", clientDetails.redirectUriUserprofile);
//   params.append("scope", clientDetails.scopeUserProfile); // Should include 'openid' at minimum
//   params.append("response_type", clientDetails.responseType);
//   params.append("acr_values", clientDetails.acrValues);
//   params.append("claims", JSON.stringify(claimsRequest)); // ← THIS IS KEY
//   params.append("claims_locales", clientDetails.claimsLocales || "en");
//   params.append("display", clientDetails.display);
//   params.append("prompt", clientDetails.prompt);
//   params.append("ui_locales", uiLocales || process.env.DEFAULT_UI_LOCALES);
//   params.append("client_assertion_type", CLIENT_ASSERTION_TYPE);
//   params.append("client_assertion", clientAssertion);
  
//   const response = await axios.post(clientDetails.parEndpoint, params.toString(), {
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//   });
//   return response.data;
// };
// const post_GetRequestUri = async (clientId, uiLocales, state) => {
//   const clientAssertion = await generateSignedJwt(
//     clientId,
//     ESIGNET_PAR_AUD_URL,
//   );
  
//   // Only request what's registered
//   const claimsRequest = {
//     userinfo: {
//       individual_id: { essential: true }
//     }
//   };
  
//   const params = new URLSearchParams();
//   params.append("nonce", clientDetails.nonce);
//   params.append("state", state || clientDetails.state);
//   params.append("client_id", clientId);
//   params.append("redirect_uri", clientDetails.redirectUriUserprofile);
//   params.append("scope", "openid"); // Minimal scope
//   params.append("response_type", clientDetails.responseType);
//   params.append("acr_values", clientDetails.acrValues);
//   params.append("claims", JSON.stringify(claimsRequest));
//   params.append("claims_locales", clientDetails.claimsLocales || "en");
//   params.append("display", clientDetails.display);
//   params.append("prompt", clientDetails.prompt);
//   params.append("ui_locales", uiLocales || process.env.DEFAULT_UI_LOCALES);
//   params.append("client_assertion_type", CLIENT_ASSERTION_TYPE);
//   params.append("client_assertion", clientAssertion);
  
//   const response = await axios.post(clientDetails.parEndpoint, params.toString(), {
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//   });
//   return response.data;
// };
const post_GetRequestUri = async (clientId, uiLocales, state) => {
  const clientAssertion = await generateSignedJwt(
    clientId,
    ESIGNET_PAR_AUD_URL,
  );
  
  // Only request individual_id since that's all that's registered
  const claimsRequest = {
    userinfo: {
      sub: { essential: true }  // sub contains the individual_id
    }
  };
  
  const params = new URLSearchParams();
  params.append("nonce", clientDetails.nonce);
  params.append("state", state || clientDetails.state);
  params.append("client_id", clientId);
  params.append("redirect_uri", clientDetails.redirectUriUserprofile);
  params.append("scope", "openid"); // Minimal scope - only openid needed for sub
  params.append("response_type", clientDetails.responseType);
  params.append("acr_values", clientDetails.acrValues);
  params.append("claims", clientDetails.userProfileClaims); //JSON.stringify(claimsRequest));
  params.append("claims_locales", clientDetails.claimsLocales || "en");
  params.append("display", clientDetails.display);
  params.append("prompt", clientDetails.prompt);
  params.append("ui_locales", uiLocales || process.env.DEFAULT_UI_LOCALES);
  params.append("client_assertion_type", CLIENT_ASSERTION_TYPE);
  params.append("client_assertion", clientAssertion);
  
  const response = await axios.post(clientDetails.parEndpoint, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};
/**
 * Triggers /oidc/userinfo API on esignet service to fetch userInformation
 * @param {string} access_token valid access token
 * @returns decrypted/decoded json user information
 */
const get_GetUserInfo = async access_token => {
  const endpoint = baseUrl + getUserInfoEndPoint;
  console.log("Requesting userinfo from:", endpoint);
  console.log("Access token (first 20 chars):", access_token.substring(0, 20) + "...");
  
  const response = await axios.get(endpoint, {
    headers: {
      Authorization: "Bearer " + access_token,
    },
  });
  
  console.log("UserInfo Response (raw):", response.data);
  const decoded = await decodeUserInfoResponse(response.data);
  console.log("UserInfo Response (decoded):", decoded);
  
  return decoded;
};

/**
 * Generates client assertion signedJWT
 * @param {string} clientId registered client id
 * @returns client assertion signedJWT
 */
const generateSignedJwt = async (clientId, audience) => {
  const alg = "RS256";

  const payload = {
    iss: clientId,
    sub: clientId,
    aud: audience,
  };

  // Your PEM private key directly from config.js
  const privateKeyPem = CLIENT_PRIVATE_KEY.trim();

  // Import PEM key
  const privateKey = await importPKCS8(privateKeyPem, alg);

  // Create the signed client assertion
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: alg, typ: "JWT" })
    .setIssuedAt()
    .setJti(Math.random().toString(36).substring(2))
    .setExpirationTime("10m")
    .sign(privateKey);
};

/**
 * decrypts and decodes the user information fetched from esignet services
 * @param {string} userInfoResponse JWE encrypted or JWT encoded user information
 * @returns decrypted/decoded json user information
 */
const decodeUserInfoResponse = async (userInfoResponse) => {
  try {
    const parts = userInfoResponse.split(".");
    const isJWE = USERINFO_RESPONSE_TYPE.toLowerCase() === "jwe" && parts.length === 5;

    if (isJWE) {
      // Decode base64-encoded JWK or JWK Set
      const jwkJson = Buffer.from(JWE_USERINFO_PRIVATE_KEY, "base64").toString("utf-8");
      const jwkParsed = JSON.parse(jwkJson);

      // Support both single JWK and JWK Set
      const jwk = Array.isArray(jwkParsed?.keys) ? jwkParsed.keys[0] : jwkParsed;

      if (!jwk || !jwk.kty || !jwk.d) {
        throw new Error("Invalid or missing private JWK");
      }

      // Ensure algorithm is present
      jwk.alg = jwk.alg || jweEncryAlgo;

      // Import private key and decrypt
      const privateKey = await importJWK(jwk, jwk.alg);
      const { plaintext } = await compactDecrypt(userInfoResponse, privateKey);
      const decrypted = new TextDecoder().decode(plaintext);
      const decoded = decodeJwt(decrypted);
      return decoded;
    } else {
      // Not encrypted - assume plain JWT
      const decoded = decodeJwt(userInfoResponse);
      return decoded;
    }
  } catch (error) {
    console.error("Failed to decode userInfoResponse:", error.message);
    throw error;
  }
};

module.exports = {
  post_GetToken,
  get_GetUserInfo,
  post_GetRequestUri,
};