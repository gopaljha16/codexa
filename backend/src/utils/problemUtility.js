const axios = require("axios");

const JUDGE0_URL = process.env.JUDGE0_URL;

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
  const res = await axios.post(
    `${JUDGE0_URL}/submissions/batch`,
    { submissions },
    {
      params: { base64_encoded: false }
    }
  );

  return res.data;
};

// Poll results
const getBatchResults = async (tokens) => {
  while (true) {
    const res = await axios.get(
      `${JUDGE0_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
          fields: "*"
        }
      }
    );

    const done = res.data.submissions.every(
      (s) => s.status.id > 2
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
