const axios = require("axios");

const JUDGE0_URL = process.env.JUDGE0_URL || (process.env.JUDGE_0_HOST_API ? `https://${process.env.JUDGE_0_HOST_API}` : "");
const JUDGE0_KEY = process.env.JUDGE_0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE_0_HOST_API;

const getHeaders = () => {
  const headers = {};
  if (JUDGE0_KEY) {
    headers["x-rapidapi-key"] = JUDGE0_KEY;
    headers["x-rapidapi-host"] = JUDGE0_HOST;
  }
  return headers;
};

const getLanguageById = (lang) => {
  const map = {
    "c": 50,
    "cpp": 54,
    "c++": 54,
    "java": 62,
    "javascript": 63,
    "python": 71
  };

  return map[lang.toLowerCase()];
};

// Submit batch
const submitBatch = async (submissions) => {
  if (!JUDGE0_URL) {
    throw new Error("JUDGE0_URL or JUDGE_0_HOST_API environment variable is missing.");
  }

  const res = await axios.post(
    `${JUDGE0_URL}/submissions/batch`,
    { submissions },
    {
      params: { base64_encoded: false },
      headers: getHeaders()
    }
  );

  return res.data;
};

// Poll results
const getBatchResults = async (tokens) => {
  if (!JUDGE0_URL) {
    throw new Error("JUDGE0_URL or JUDGE_0_HOST_API environment variable is missing.");
  }

  while (true) {
    const res = await axios.get(
      `${JUDGE0_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
          fields: "*"
        },
        headers: getHeaders()
      }
    );

    const done = res.data.submissions.every(
      (s) => s.status && s.status.id > 2
    );

    if (done) return res.data.submissions;

    await new Promise((r) => setTimeout(r, 1000));
  }
};

module.exports = {
  getLanguageById,
  SubmitBatch: submitBatch,
  submitToken: getBatchResults
};
