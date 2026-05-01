const BASE_URL = "http://localhost:3001";

async function timedFetch(url) {
  const start = performance.now();
  const response = await fetch(url);
  const end = performance.now();
async function timedFetch(url, options = {}) {
  const timings = [];
  let response;
  let data = {};

  const data = await response.json();
  for (let i = 0; i < 4; i++) {
    const start = performance.now();
    response = await fetch(url, options);
    const end = performance.now();
    timings.push(Number((end - start).toFixed(2)));

    try {
      data = await response.json();
    } catch {
      data = {};
    }
  }

  const avg = Number((timings.reduce((a, b) => a + b, 0) / 4).toFixed(2));

  return {
    ok: response.ok,
    status: response.status,
    data,
    timeMs: Number((end - start).toFixed(2)),
    timings,
    timeMs: avg,
  };
}

function printResult(testName, passed, details, timeMs) {
function printResult(testName, passed, details, timeMs, timings = []) {
  console.log(`\nTest Case: ${testName}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Details: ${details}`);
  console.log(`Actual Timing: ${timeMs}ms`);
  console.log(`Average Timing: ${timeMs}ms ${timings.length > 0 ? `([${timings.join(", ")}])` : ""}`);
}

async function runSearchDiscoveryTests() {
  console.log("=== Search & Discovery Evaluation Tests ===");

  const searchTerms = ["james", "student", "club", "computing"];

  for (const term of searchTerms) {
    const url = `${BASE_URL}/users/search/all?q=${encodeURIComponent(term)}`;
    const result = await timedFetch(url);

    const results = result.data.results || [];
    const hasValidShape = results.every(
      (item) => item.id !== undefined && item.resultType
    );

    printResult(
      `Search query "${term}" returns valid discovery results`,
      result.ok && Array.isArray(results) && hasValidShape,
      `Returned ${results.length} result(s). Result types: ${
        [...new Set(results.map((r) => r.resultType))].join(", ") || "none"
      }`,
      result.timeMs
      result.timeMs,
      result.timings
    );
  }

  console.log("\n=== Search & Discovery Tests Complete ===");
}

runSearchDiscoveryTests().catch((error) => {
  console.error("Test run failed:", error);
});