import { test } from "node:test";
import assert from "node:assert";

/**
 * Approval Metrics Tests
 *
 * Tests for tracking and calculating approval statistics
 */

test("Approval Metrics Calculation - Basic", () => {
  // Simulate metrics calculation
  const pending = [
    {
      agentId: "researcher",
      step: "research",
      requestedAt: new Date(Date.now() - 45000).toISOString(), // 45s ago
      escalatedAt: new Date(Date.now() - 15000).toISOString(), // 15s ago
      clickedAt: new Date(Date.now() - 5000).toISOString(), // Approved 5s ago
    },
    {
      agentId: "writer",
      step: "write",
      requestedAt: new Date(Date.now() - 30000).toISOString(),
      escalatedAt: null,
      clickedAt: null, // Still pending
    },
  ];

  const responseTimes = pending
    .filter((p) => p.clickedAt)
    .map((p) => {
      const requested = new Date(p.requestedAt).getTime();
      const clicked = new Date(p.clickedAt).getTime();
      return Math.round((clicked - requested) / 1000);
    });

  assert.strictEqual(pending.length, 2, "Should have 2 pending approvals");
  assert.strictEqual(responseTimes.length, 1, "Should have 1 response time");
  assert(responseTimes[0] >= 40 && responseTimes[0] <= 46, `Response time should be ~45s, got ${responseTimes[0]}`);
});

test("Approval Metrics - Escalation Timing", () => {
  const requestedAt = new Date(Date.now() - 60000).toISOString(); // 60s ago
  const escalatedAt = new Date(Date.now() - 50000).toISOString(); // Escalated 10s after request

  const requested = new Date(requestedAt).getTime();
  const escalated = new Date(escalatedAt).getTime();
  const escalationTime = Math.round((escalated - requested) / 1000);

  assert.strictEqual(escalationTime, 10, "Escalation should occur at 10 second mark");
});

test("Approval Metrics - Response Time Categories", () => {
  const responseTimes = [5, 15, 30, 45, 120, 300]; // Various response times in seconds

  const fastResponses = responseTimes.filter((t) => t < 30).length; // 2 fast
  const mediumResponses = responseTimes.filter((t) => t >= 30 && t < 120).length; // 2 medium
  const slowResponses = responseTimes.filter((t) => t >= 120).length; // 2 slow

  assert.strictEqual(fastResponses, 2, "Should have 2 fast responses (<30s)");
  assert.strictEqual(mediumResponses, 2, "Should have 2 medium responses (30-120s)");
  assert.strictEqual(slowResponses, 2, "Should have 2 slow responses (120s+)");
});

test("Approval Metrics - Rate Calculations", () => {
  const totalRequests = 10;
  const totalApproved = 7;
  const totalRevised = 3;

  const approvalRate = (totalApproved / totalRequests) * 100;
  const revisionRate = (totalRevised / totalRequests) * 100;

  assert.strictEqual(approvalRate, 70, "Approval rate should be 70%");
  assert.strictEqual(revisionRate, 30, "Revision rate should be 30%");
  assert.strictEqual(approvalRate + revisionRate, 100, "Rates should sum to 100%");
});

test("Approval Metrics - Average Calculation", () => {
  const responseTimes = [10, 20, 30, 40, 50];
  const average = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);

  assert.strictEqual(average, 30, "Average should be 30 seconds");
});

test("Approval Metrics - Fastest and Slowest", () => {
  const responseTimes = [5, 15, 30, 45, 120];

  const fastest = Math.min(...responseTimes);
  const slowest = Math.max(...responseTimes);

  assert.strictEqual(fastest, 5, "Fastest should be 5 seconds");
  assert.strictEqual(slowest, 120, "Slowest should be 120 seconds");
});

test("Approval Metrics - Empty State", () => {
  const metrics = {
    totalRequests: 0,
    totalApproved: 0,
    totalRevised: 0,
    approvalRate: 0,
    revisionRate: 0,
    averageResponseTime: 0,
    fastestResponse: 0,
    slowestResponse: 0,
    currentlyPending: 0,
    averageEscalationTime: 0,
  };

  assert.strictEqual(metrics.totalRequests, 0);
  assert.strictEqual(metrics.approvalRate, 0);
});

test("Approval Metrics - Format for Display", () => {
  const metrics = {
    totalRequests: 10,
    totalApproved: 7,
    totalRevised: 3,
    approvalRate: 70,
    revisionRate: 30,
    averageResponseTime: 45,
    fastestResponse: 5,
    slowestResponse: 300,
    currentlyPending: 2,
    averageEscalationTime: 10,
  };

  const summary = `${metrics.totalRequests} approvals • ${metrics.approvalRate}% approved`;
  const expected = "10 approvals • 70% approved";

  assert.strictEqual(summary, expected);
  assert(summary.includes("approvals"));
  assert(summary.includes("approved"));
});

test("Approval Metrics - Pending Status Tracking", () => {
  const pending = [
    {
      agentId: "agent1",
      step: "step1",
      requestedAt: new Date().toISOString(),
      escalatedAt: null,
      clickedAt: new Date().toISOString(), // Responded
    },
    {
      agentId: "agent2",
      step: "step2",
      requestedAt: new Date().toISOString(),
      escalatedAt: null,
      clickedAt: null, // Still pending
    },
    {
      agentId: "agent3",
      step: "step3",
      requestedAt: new Date().toISOString(),
      escalatedAt: null,
      clickedAt: null, // Still pending
    },
  ];

  const currentlyPending = pending.filter((p) => p.clickedAt === null).length;
  const responded = pending.filter((p) => p.clickedAt !== null).length;

  assert.strictEqual(currentlyPending, 2, "Should have 2 pending");
  assert.strictEqual(responded, 1, "Should have 1 responded");
  assert.strictEqual(pending.length, 3, "Should have 3 total");
});

test("Approval Metrics - Performance Insights", () => {
  // Simulate run with approvals at different times
  const metrics = {
    avgResponseTime: 45, // 45 seconds average
    fastest: 5, // 5 seconds (very quick decisions)
    slowest: 350, // 5+ minutes (neglected approval)
  };

  const performanceInsight =
    metrics.slowest > 600
      ? "Critical: Some approvals took 10+ minutes"
      : metrics.slowest > 300
        ? "Warning: Some approvals took 5+ minutes"
        : metrics.avgResponseTime > 120
          ? "Note: Average approval time is high"
          : "Approval response times are good";

  assert(
    performanceInsight.includes("Warning"),
    "Should warn about 5+ minute approvals when max is 350s"
  );
});
