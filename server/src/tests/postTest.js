const BASE_URL = "http://localhost:3001";

const userId = 1; // james
const otherUserId = 4; // esther

async function timedFetch(url, options = {}) {
  const timings = [];
  let lastResponse;
  let firstData = null;

  // Only repeat GET requests to avoid side effects
  const isReadRequest = !options.method || options.method === "GET";
  const iterations = isReadRequest ? 4 : 1;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const response = await fetch(url, options);
    const end = performance.now();
    
    timings.push(Number((end - start).toFixed(2)));

    if (i === 0) {
      lastResponse = response;
      try {
        firstData = await response.json();
      } catch {
        firstData = {};
      }
    } else {
      // Consume body for subsequent samples to release resources
      await response.text().catch(() => {});
    }
  }

  const avg = timings.length > 0 
    ? Number((timings.reduce((a, b) => a + b, 0) / timings.length).toFixed(2)) 
    : 0;

  return {
    ok: lastResponse.ok,
    status: lastResponse.status,
    data: firstData,
    timings,
    timeMs: avg,
  };
}

function printResult(testName, passed, details, timeMs, timings = []) {
  console.log(`\nTest Case: ${testName}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Details: ${details}`);
  console.log(`Average Timing: ${timeMs}ms ${timings.length > 0 ? `([${timings.join(", ")}])` : ""}`);
}

async function runPostTests() {
  console.log("=== Post Evaluation Tests ===");

  // 1. Create a global post
  const globalPostRes = await timedFetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorId: userId,
      content: "This is a global test post " + Date.now(),
    }),
  });

  printResult(
    "Create global post",
    globalPostRes.ok && globalPostRes.data.post,
    `Post ID: ${globalPostRes.data.post?.id || "N/A"}`,
    globalPostRes.timeMs,
    globalPostRes.timings
  );

  // 2. Setup a community for testing community posts
  const commRes = await timedFetch(`${BASE_URL}/communities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Post Test Community " + Date.now(),
      type: "Club",
      category: "Testing",
      description: "Testing community posts",
      creatorId: userId,
    }),
  });

  const communityId = commRes.data?.community?.id;

  if (!communityId) {
    console.error("Critical Failure: Could not create test community for posting.");
    return;
  }

  // 3. Create a post in a community (as member/admin)
  const commPostRes = await timedFetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorId: userId,
      content: "This is a community post",
      communityId: communityId,
    }),
  });

  printResult(
    "Create community post",
    commPostRes.ok && commPostRes.data.post?.communityId === communityId,
    `Post created in community ${communityId}`,
    commPostRes.timeMs,
    commPostRes.timings
  );

  // 4. Attempt to post in a community without joining
  const unauthorizedPostRes = await timedFetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorId: otherUserId, // User who hasn't joined
      content: "I should not be allowed to post here",
      communityId: communityId,
    }),
  });

  printResult(
    "Prevent unauthorized community post",
    unauthorizedPostRes.status === 403,
    `Status: ${unauthorizedPostRes.status} - ${unauthorizedPostRes.data.error}`,
    unauthorizedPostRes.timeMs,
    unauthorizedPostRes.timings
  );

  console.log("\n=== Post Tests Complete ===");
}

runPostTests().catch((err) => {
  console.error("Test run failed:", err);
});