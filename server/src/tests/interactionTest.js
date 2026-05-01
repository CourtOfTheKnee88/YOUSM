const BASE_URL = "http://localhost:3001";

const userId = 1; // james
const interactorId = 4; // esther

async function timedFetch(url, options = {}) {
  const timings = [];
  let lastResponse;
  let firstData = null;

  // Only repeat GET requests to avoid side effects (toggles, duplicate creation, etc.)
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

async function runInteractionTests() {
  console.log("=== Post Interaction Evaluation Tests ===");

  // 1. Create a post to interact with
  const postRes = await timedFetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorId: userId,
      content: "Interaction test post",
    }),
  });
  const postId = postRes.data?.post?.id;

  if (!postId) {
    console.error("Critical Failure: Could not create post for interaction testing.");
    return;
  }

  // 2. Like the post
  const likeRes = await timedFetch(`${BASE_URL}/posts/${postId}/interact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: interactorId, type: "like" }),
  });

  printResult(
    "Like a post",
    likeRes.ok && likeRes.data.liked === true,
    `Post ${postId} liked by user ${interactorId}`,
    likeRes.timeMs,
    likeRes.timings
  );

  // 3. Unlike the post (toggle)
  const unlikeRes = await timedFetch(`${BASE_URL}/posts/${postId}/interact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: interactorId, type: "like" }),
  });

  printResult(
    "Unlike a post (toggle)",
    unlikeRes.ok && unlikeRes.data.liked === false,
    `Post ${postId} unliked by user ${interactorId}`,
    unlikeRes.timeMs,
    unlikeRes.timings
  );

  // 4. Comment on the post
  const commentText = "Great post!";
  const commentRes = await timedFetch(`${BASE_URL}/posts/${postId}/interact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: interactorId, type: "comment", content: commentText }),
  });

  printResult(
    "Comment on a post",
    commentRes.ok && commentRes.data.interaction.content === commentText,
    `Comment added: "${commentText}"`,
    commentRes.timeMs,
    commentRes.timings
  );

  // 5. Share the post
  const shareRes = await timedFetch(`${BASE_URL}/posts/${postId}/interact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: interactorId, type: "share" }),
  });

  printResult(
    "Share a post",
    shareRes.ok && shareRes.data.interaction.type === "share",
    `Share interaction recorded`,
    shareRes.timeMs,
    shareRes.timings
  );

  // 6. Verify stats
  const verifyRes = await timedFetch(`${BASE_URL}/posts/${postId}`);
  const post = verifyRes.data?.post;
  
  if (post) {
    console.log(`\nFinal Stats for Post ${postId}:`);
    console.log(`Likes: ${post.likeCount}, Comments: ${post.commentCount}, Shares: ${post.shareCount}`);
  }

  console.log("\n=== Interaction Tests Complete ===");
}

runInteractionTests().catch((err) => {
  console.error("Test run failed:", err);
});