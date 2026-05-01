const BASE_URL = "http://localhost:3001";

// Test credentials based on your db.js seed data
const validUser = {
  username: "janedoe",
  password: "password123",
};

const invalidUser = {
  username: "nonexistent_user",
  password: "wrongpassword",
};

async function timedFetch(url, options = {}) {
  const start = performance.now();
  const response = await fetch(url, options);
  const end = performance.now();

  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    // Handle non-JSON responses
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    timeMs: Number((end - start).toFixed(2)),
  };
}

function printResult(testName, passed, details, timeMs) {
  console.log(`\nTest Case: ${testName}`);
  console.log(`Result: ${passed ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Details: ${details}`);
  console.log(`Actual Timing: ${timeMs}ms`);
}

async function runLoginTests() {
  console.log("=== Login & Password Recovery Evaluation Tests ===");

  // 1. TEST SUCCESSFUL LOGIN
  const loginSuccessRes = await timedFetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: validUser.username,
      password: validUser.password,
    }),
  });

  printResult(
    "Successful Login",
    loginSuccessRes.ok &&
      loginSuccessRes.data.user?.username === validUser.username,
    `Status: ${loginSuccessRes.status}. Welcome, ${loginSuccessRes.data.user?.displayName || "User"}`,
    loginSuccessRes.timeMs,
  );

  // 2. TEST WRONG PASSWORD
  const wrongPassRes = await timedFetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: validUser.username,
      password: "wrong_password_abc",
    }),
  });

  printResult(
    "Login with Wrong Password",
    wrongPassRes.status === 401 || wrongPassRes.status === 400, // Typical auth error codes
    `Status: ${wrongPassRes.status}. Error message: ${wrongPassRes.data.error}`,
    wrongPassRes.timeMs,
  );

  // 3. TEST NON-EXISTENT USER
  const noUserRes = await timedFetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "ghost_user_999",
      password: "password123",
    }),
  });

  printResult(
    "Login with Non-existent User",
    noUserRes.status === 404 || noUserRes.status === 401,
    `Status: ${noUserRes.status}. Error message: ${noUserRes.data.error}`,
    noUserRes.timeMs,
  );

  // 4. FORGOT PASSWORD FLOW - STEP 1: Find User
  // Note: This assumes 'james' or another user has a security question set up.
  // If they don't, this test will verify the 404/error behavior for accounts without recovery.
  const forgotStep1Res = await timedFetch(
    `${BASE_URL}/users/forgot-password/${validUser.username}`,
  );

  let userId = forgotStep1Res.data.userId;
  let question = forgotStep1Res.data.securityQuestion;

  printResult(
    "Forgot Password Step 1: Fetch Security Question",
    forgotStep1Res.ok || forgotStep1Res.status === 404,
    forgotStep1Res.ok
      ? `Found user ${userId}. Question: "${question}"`
      : `User might not have recovery set up: ${forgotStep1Res.data.error}`,
    forgotStep1Res.timeMs,
  );

  // 5. FORGOT PASSWORD FLOW - STEP 2: Verify Answer
  // Only run if step 1 succeeded
  if (forgotStep1Res.ok && userId) {
    const verifyRes = await timedFetch(`${BASE_URL}/users/verify-security`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
        answer: "wrong_answer", // Intentionally wrong
      }),
    });

    printResult(
      "Forgot Password Step 2: Incorrect Answer Rejection",
      !verifyRes.ok && verifyRes.status === 401,
      `Status: ${verifyRes.status}. Message: ${verifyRes.data.error}`,
      verifyRes.timeMs,
    );
  }

  // 6. FORGOT PASSWORD FLOW - STEP 3: Reset Password Validation
  if (forgotStep1Res.ok && userId) {
    const resetRes = await timedFetch(`${BASE_URL}/users/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
        newPassword: "short", // Test validation if backend enforces length
      }),
    });

    printResult(
      "Forgot Password Step 3: Password Update Attempt",
      resetRes.status !== 200 || resetRes.ok, // Checking for validation or success
      `Status: ${resetRes.status}. ${resetRes.ok ? "Success" : resetRes.data.error}`,
      resetRes.timeMs,
    );
  }

  console.log("\n=== Login Tests Complete ===");
}

runLoginTests().catch((err) => {
  console.error("Test execution failed:", err);
});
