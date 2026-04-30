const BASE_URL = "http://localhost:3001";

const creatorUserId = 1;
const joiningUserId = 4;

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

async function runCommunityTests() {
  console.log("=== Community Evaluation Tests ===");

  const testCommunityName = `TEST_Auto_Community_${Date.now()}`;

  // 1. CREATE COMMUNITY
  const createRes = await timedFetch(`${BASE_URL}/communities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testCommunityName,
      type: "Club",
      category: "Testing",
      description: "Automated test community",
      creatorId: creatorUserId,
    }),
  });

  const communityId = createRes.data?.community?.id;

  printResult(
    "Create community",
    createRes.ok && communityId,
    `Community ID: ${communityId || "not created"}`,
    createRes.timeMs
  );

  if (!communityId) {
    console.log("Stopping tests (community not created)");
    return;
  }

  // 2. VERIFY COMMUNITY EXISTS
  const listRes = await timedFetch(`${BASE_URL}/communities`);

  const found = (listRes.data.communities || []).some(
    (c) => c.id === communityId
  );

  printResult(
    "Verify community appears in list",
    listRes.ok && found,
    `Found in list: ${found}`,
    listRes.timeMs
  );

  // 3. JOIN COMMUNITY
  const joinRes = await timedFetch(
    `${BASE_URL}/communities/${communityId}/join`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: joiningUserId }),
    }
  );

  printResult(
    "User joins community",
    joinRes.ok,
    `Join response status: ${joinRes.status}`,
    joinRes.timeMs
  );

  // 4. VERIFY USER MEMBERSHIP
  const userCommRes = await timedFetch(
    `${BASE_URL}/communities/user/${joiningUserId}`
  );

  const joined = (userCommRes.data.communities || []).some(
    (c) => c.id === communityId
  );

  printResult(
    "Verify user membership in community",
    userCommRes.ok && joined,
    `User joined: ${joined}`,
    userCommRes.timeMs
  );

  console.log("\n=== Community Tests Complete ===");
}

runCommunityTests().catch((err) => {
  console.error("Test run failed:", err);
});