const BASE_URL = "http://localhost:3001";

const creatorUserId = 1; // james: community creator/admin
const promotedUserId = 4; // esther: member promoted to admin
const bannedUserId = 2; // gage: member temporarily banned from posting

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

async function runCommunityAdminRoleTests() {
  console.log("=== Community Admin / Role Evaluation Tests ===");

  const testCommunityName = `TEST_Admin_Role_Community_${Date.now()}`;

  // 1. Create community
  const createRes = await timedFetch(`${BASE_URL}/communities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testCommunityName,
      type: "Club",
      category: "Testing",
      description: "Automated admin/role test community",
      creatorId: creatorUserId,
    }),
  });

  const communityId = createRes.data?.community?.id;

  printResult(
    "Create community for admin/role testing",
    createRes.ok && communityId,
    `Community ID: ${communityId || "not created"}`,
    createRes.timeMs
  );

  if (!communityId) {
    console.log("Stopping tests because community was not created.");
    return;
  }

  // 2. Add members
  const joinPromotedRes = await timedFetch(
    `${BASE_URL}/communities/${communityId}/join`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: promotedUserId }),
    }
  );

  printResult(
    "Add member who will be promoted",
    joinPromotedRes.ok,
    `Join response status: ${joinPromotedRes.status}`,
    joinPromotedRes.timeMs
  );

  const joinBannedRes = await timedFetch(
    `${BASE_URL}/communities/${communityId}/join`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: bannedUserId }),
    }
  );

  printResult(
    "Add member who will be temporarily banned",
    joinBannedRes.ok,
    `Join response status: ${joinBannedRes.status}`,
    joinBannedRes.timeMs
  );

  // 3. Verify creator is admin
  const creatorDetailRes = await timedFetch(
    `${BASE_URL}/communities/${communityId}?userId=${creatorUserId}`
  );

  const creatorIsAdmin =
    creatorDetailRes.data?.community?.isAdmin === 1 ||
    creatorDetailRes.data?.community?.isAdmin === true;

  printResult(
    "Verify creator has community admin role",
    creatorDetailRes.ok && creatorIsAdmin,
    `Creator admin status: ${creatorIsAdmin}`,
    creatorDetailRes.timeMs
  );

  // 4. Non-admin should not promote another member
  const nonAdminPromoteRes = await timedFetch(
    `${BASE_URL}/communities/${communityId}/admins`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminUserId: bannedUserId,
        targetUserId: promotedUserId,
      }),
    }
  );

  printResult(
    "Prevent non-admin from promoting member",
    !nonAdminPromoteRes.ok,
    `Non-admin promote status: ${nonAdminPromoteRes.status}`,
    nonAdminPromoteRes.timeMs
  );

  // 5. Admin promotes member
  const promoteRes = await timedFetch(
    `${BASE_URL}/communities/${communityId}/admins`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminUserId: creatorUserId,
        targetUserId: promotedUserId,
      }),
    }
  );

  printResult(
    "Admin promotes member to community admin",
    promoteRes.ok,
    `Promote response status: ${promoteRes.status}`,
    promoteRes.timeMs
  );

  // 6. Verify promoted user is now admin
  const promotedDetailRes = await timedFetch(
    `${BASE_URL}/communities/${communityId}?userId=${promotedUserId}`
  );

  const promotedIsAdmin =
    promotedDetailRes.data?.community?.isAdmin === 1 ||
    promotedDetailRes.data?.community?.isAdmin === true;

  printResult(
    "Verify promoted member has admin role",
    promotedDetailRes.ok && promotedIsAdmin,
    `Promoted user admin status: ${promotedIsAdmin}`,
    promotedDetailRes.timeMs
  );

  // 7. Admin temporarily bans regular member
  const banRes = await timedFetch(`${BASE_URL}/communities/${communityId}/bans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      adminUserId: creatorUserId,
      targetUserId: bannedUserId,
      durationMinutes: 10,
      reason: "Automated testing ban",
    }),
  });

  printResult(
    "Admin temporarily bans member from posting",
    banRes.ok,
    `Ban response status: ${banRes.status}`,
    banRes.timeMs
  );

  // 8. Verify banned member cannot post
  const bannedPostRes = await timedFetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorId: bannedUserId,
      communityId,
      postType: "post",
      content: "This post should be blocked by the temporary ban.",
    }),
  });

  printResult(
    "Prevent temporarily banned member from posting",
    !bannedPostRes.ok,
    `Blocked post status: ${bannedPostRes.status}. Error: ${
      bannedPostRes.data?.error || "none"
    }`,
    bannedPostRes.timeMs
  );

  console.log("\n=== Community Admin / Role Tests Complete ===");
}

runCommunityAdminRoleTests().catch((err) => {
  console.error("Test run failed:", err);
});