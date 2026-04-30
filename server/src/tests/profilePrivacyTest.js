const BASE_URL = "http://localhost:3001";

const publicUserId = 8;   // testuser_e01 (public)
const privateUserId = 9;  // testuser_e02 (private)
const viewerUserId = 1;   // james (viewer)

async function timedFetch(url, options = {}) {
  const start = performance.now();
  const response = await fetch(url, options);
  const end = performance.now();

  let data = {};
  try {
    data = await response.json();
  } catch {}

  return {
    ok: response.ok,
    status: response.status,
    data,
    timeMs: Number((end - start).toFixed(2)),
  };
}

function printResult(testName, passed, details, timeMs) {
  console.log(`\nTest Case: ${testName}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Details: ${details}`);
  console.log(`Actual Timing: ${timeMs}ms`);
}

async function runProfileTests() {
  console.log("=== Profile & Privacy Evaluation Tests ===");

  // 1. View public profile
  const publicRes = await timedFetch(
    `${BASE_URL}/users/${publicUserId}/profile?viewerId=${viewerUserId}`
  );

  const publicVisible = publicRes.data?.user !== undefined;

  printResult(
    "Public profile is accessible",
    publicRes.ok && publicVisible,
    `Public profile visible: ${publicVisible}`,
    publicRes.timeMs
  );

  // 2. View private profile (before follow)
  const privateRes = await timedFetch(
    `${BASE_URL}/users/${privateUserId}/profile?viewerId=${viewerUserId}`
  );

  const canViewPostsBefore = privateRes.data?.user?.canViewPosts === true;

  printResult(
    "Private profile restricts content before follow",
    privateRes.ok && !canViewPostsBefore,
    `Can view posts before follow: ${canViewPostsBefore}`,
    privateRes.timeMs
  );

  // 3. Send follow request
  const followRes = await timedFetch(
    `${BASE_URL}/users/${privateUserId}/follow`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId: viewerUserId }),
    }
  );

  printResult(
    "Follow request created for private profile",
    followRes.ok,
    `Follow status: ${followRes.data?.status}`,
    followRes.timeMs
  );

  // 4. Accept follow request (simulate private user accepting)
  const requestId = followRes.data?.request?.id;

  let acceptPassed = false;
  let acceptTime = 0;

  if (requestId) {
    const acceptRes = await timedFetch(
      `${BASE_URL}/users/${privateUserId}/follow-requests/${requestId}/respond`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      }
    );

    acceptPassed = acceptRes.ok;
    acceptTime = acceptRes.timeMs;
  }

  printResult(
    "Private user accepts follow request",
    acceptPassed,
    `Request accepted: ${acceptPassed}`,
    acceptTime
  );

  // 5. View private profile after follow
  const privateAfterRes = await timedFetch(
    `${BASE_URL}/users/${privateUserId}/profile?viewerId=${viewerUserId}`
  );

  const canViewPostsAfter =
    privateAfterRes.data?.user?.canViewPosts === true;

  printResult(
    "Private profile allows access after approval",
    privateAfterRes.ok && canViewPostsAfter,
    `Can view posts after follow: ${canViewPostsAfter}`,
    privateAfterRes.timeMs
  );

  console.log("\n=== Profile & Privacy Tests Complete ===");
}

runProfileTests().catch((err) => {
  console.error("Test run failed:", err);
});