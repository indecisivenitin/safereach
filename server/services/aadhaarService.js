import axios from "axios";

export const validateAadhaar = async (aadhaarNumber) => {
  try {
    const response = await axios.post(
      "https://api.apyhub.com/validate/aadhaar",
      {
        aadhaar: aadhaarNumber,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "apy-token": process.env.APYHUB_API_KEY,
        },
      }
    );

    // ApyHub returns boolean validation result
    return response.data?.data === true;
  } catch (error) {
    console.error(
      "Aadhaar validation error:",
      error.response?.data || error.message
    );

    return false;
  }
};