const axios = require('axios');
const FormData = require('form-data');

let cachedToken = null;
let tokenExpiry = null;

// Generate Nyckel Access Token
const getNyckelToken = async () => {
  try {
    // Reuse token if still valid
    if (
      cachedToken &&
      tokenExpiry &&
      Date.now() < tokenExpiry
    ) {
      return cachedToken;
    }

    const response = await axios.post(
      'https://www.nyckel.com/connect/token',

      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.NYCKEL_CLIENT_ID,
        client_secret: process.env.NYCKEL_CLIENT_SECRET,
      }),

      {
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
      }
    );

    const {
      access_token,
      expires_in,
    } = response.data;

    cachedToken = access_token;

    // Expire token slightly early
    tokenExpiry =
      Date.now() + (expires_in - 60) * 1000;

    return access_token;

  } catch (error) {

    console.error(
      'Nyckel Token Error:',
      error.response?.data || error.message
    );

    throw new Error(
      'Failed to generate Nyckel token'
    );
  }
};

// Verify Woman Image
const verifyWomanImage = async (
  imageBuffer
) => {
  try {

    const token =
      await getNyckelToken();

    const formData = new FormData();

    formData.append(
      'data',
      imageBuffer,
      {
        filename: 'selfie.jpg',
        contentType: 'image/jpeg',
      }
    );

    const response = await axios.post(
      `https://www.nyckel.com/v1/functions/${process.env.NYCKEL_FUNCTION_ID}/invoke`,

      formData,

      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      }
    );

    return response.data;

  } catch (error) {

    console.error(
      'Nyckel Verification Error:',
      error.response?.data || error.message
    );

    throw new Error(
      'Image verification failed'
    );
  }
};

module.exports = {
  getNyckelToken,
  verifyWomanImage,
};