const axios = require("axios");

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const getPistonConfig = (lang) => {
  const map = {
    "c": { language: "c", version: "10.2.0" },
    "cpp": { language: "c++", version: "10.2.0" },
    "c++": { language: "c++", version: "10.2.0" },
    "java": { language: "java", version: "15.0.2" },
    "javascript": { language: "javascript", version: "18.15.0" },
    "js": { language: "javascript", version: "18.15.0" },
    "python": { language: "python", version: "3.10.0" },
    "python3": { language: "python", version: "3.10.0" }
  };
  return map[lang.toLowerCase()];
};

const getLanguageById = (lang) => {
  // Keeping this for compatibility with existing controller logic if needed, 
  // but Piston uses language names.
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

// Execute single submission via Piston
const executePiston = async (submission) => {
  const config = getPistonConfig(submission.language);
  if (!config) throw new Error(`Unsupported language: ${submission.language}`);

  const payload = {
    language: config.language,
    version: config.version,
    files: [
      {
        content: submission.source_code
      }
    ],
    stdin: submission.stdin || ""
  };

  try {
    const res = await axios.post(PISTON_URL, payload);
    const { run, compile } = res.data;
    
    // Map Piston response to Judge0-like format for minimal controller changes
    // Judge0 status_id 3 = Accepted, 4 = Wrong Answer, 6 = Compilation Error, etc.
    let status_id = 3; 
    let stderr = run.stderr || (compile ? compile.stderr : "");
    let stdout = run.stdout;

    if (compile && compile.code !== 0) {
      status_id = 6; // Compilation Error
    } else if (run.code !== 0) {
      status_id = 11; // Runtime Error (mapping to Judge0 Runtime Error)
    } else if (submission.expected_output && stdout.trim() !== submission.expected_output.trim()) {
      status_id = 4; // Wrong Answer
    }

    return {
      status_id,
      stdout,
      stderr,
      time: 0, // Piston public API doesn't provide precise time/memory in the same way
      memory: 0,
      status: { id: status_id }
    };
  } catch (error) {
    console.error("Piston execution error:", error.response?.data || error.message);
    return {
      status_id: 13, // Internal Error
      stderr: error.message,
      status: { id: 13 }
    };
  }
};

// Submit batch (Parallel Piston calls)
const submitBatch = async (submissions) => {
  // In Judge0, submissions objects have language_id. 
  // We need to map back to names or change controller.
  // For now, let's assume we can determine language from the first submission or add 'language' field.
  
  // Controller sends: { source_code, language_id, stdin, expected_output }
  // We need to map language_id back to name for Piston
  const idToName = {
    50: "c",
    54: "cpp",
    62: "java",
    63: "javascript",
    71: "python"
  };

  const results = await Promise.all(submissions.map(s => {
    return executePiston({
      ...s,
      language: idToName[s.language_id] || "javascript"
    });
  }));

  // Store results temporarily to be returned by getBatchResults (submitToken)
  // Since Piston is immediate, we just return the results directly in a way the controller expects tokens.
  // Actually, let's just make getBatchResults return these results.
  return results; 
};

// Poll results (Piston is synchronous, so this just returns the results)
const getBatchResults = async (results) => {
  return results;
};

module.exports = {
  getLanguageById,
  SubmitBatch: submitBatch,
  submitToken: getBatchResults
};
