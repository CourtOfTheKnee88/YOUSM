const BASE_URL = "http://localhost:3001";

const followerId = 1; // james
const followingId = 4; // esther

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
      // Consume body for samples 2-4 to release resources without redundant parsing
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

async function runFeedTests() {
  console.log("=== Feed Evaluation Tests ===");

  // 1. Ensure user is following the other user
  await timedFetch(`${BASE_URL}/users/${followingId}/follow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requesterId: followerId }),
  });

  // 2. Following user creates a post
  const postContent = "Feed test post " + Date.now();
  const postRes = await timedFetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorId: followingId,
      content: postContent,
    }),
  });

  const postId = postRes.data?.post?.id;

  if (!postId) {
    console.error("Critical Failure: Could not create post for feed testing.");
    return;
  }

  // 3. Fetch the follower's feed
  const feedRes = await timedFetch(`${BASE_URL}/posts/feed/${followerId}`);
  
  const posts = feedRes.data.posts || [];
  const found = posts.some(p => p.id === postId);

  printResult(
    "Followed user's post appears in feed",
    feedRes.ok && found,
    `Post ${postId} found in feed for user ${followerId}`,
    feedRes.timeMs,
    feedRes.timings
  );

  // 4. Fetch personal posts only
  const profileRes = await timedFetch(`${BASE_URL}/users/${followingId}`);
  const profilePosts = profileRes.data.posts || [];
  const foundInProfile = profilePosts.some(p => p.id === postId);

  printResult(
    "Post appears in author's profile",
    profileRes.ok && foundInProfile,
    `Author profile contains post ${postId}`,
    profileRes.timeMs,
    profileRes.timings
  );

  // 5. Test global "all" feed
  const allRes = await timedFetch(`${BASE_URL}/posts/all`);
  const allFound = (allRes.data.posts || []).some(p => p.id === postId);

  printResult(
    "Post appears in global 'all' feed",
    allRes.ok && allFound,
    `Global feed contains post ${postId}`,
    allRes.timeMs,
    allRes.timings
  );

  console.log("\n=== Feed Tests Complete ===");
}

runFeedTests().catch((err) => {
  console.error("Test run failed:", err);
});