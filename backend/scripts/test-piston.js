const { SubmitBatch } = require('../src/utils/problemUtility');

async function test() {
    console.log("Testing Python execution...");
    const pythonSubmission = [{
        source_code: "print('Hello World')",
        language_id: 71, // Python
        stdin: "",
        expected_output: "Hello World"
    }];

    try {
        const results = await SubmitBatch(pythonSubmission);
        console.log("Python Results:", JSON.stringify(results, null, 2));
        if (results[0].status_id === 3) {
            console.log("✅ Python Test Passed!");
        } else {
            console.log("❌ Python Test Failed with status:", results[0].status_id);
        }
    } catch (err) {
        console.error("❌ Python Test Error:", err.message);
    }

    console.log("\nTesting JavaScript execution...");
    const jsSubmission = [{
        source_code: "console.log(1 + 1)",
        language_id: 63, // JS
        stdin: "",
        expected_output: "2"
    }];

    try {
        const results = await SubmitBatch(jsSubmission);
        console.log("JS Results:", JSON.stringify(results, null, 2));
        if (results[0].status_id === 3) {
            console.log("✅ JS Test Passed!");
        } else {
            console.log("❌ JS Test Failed with status:", results[0].status_id);
        }
    } catch (err) {
        console.error("❌ JS Test Error:", err.message);
    }
}

test();
