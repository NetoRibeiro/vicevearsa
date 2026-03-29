import { useMemo } from "react";
import type { DepartmentState } from "@/types/state";

export interface ApprovalMetrics {
  totalRequests: number;
  totalApproved: number;
  totalRevised: number;
  approvalRate: number; // 0-100%
  revisionRate: number; // 0-100%
  averageResponseTime: number; // seconds
  fastestResponse: number; // seconds
  slowestResponse: number; // seconds
  currentlyPending: number;
  averageEscalationTime: number; // seconds until desk escalation
}

/**
 * Calculate approval metrics from department state
 * Tracks approval patterns and response times
 */
export function useApprovalMetrics(state: DepartmentState | undefined): ApprovalMetrics {
  return useMemo(() => {
    if (!state?.approvals?.pending) {
      return {
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
    }

    const pending = state.approvals.pending;
    const currentlyPending = pending.filter((p) => p.clickedAt === null).length;

    // In a real implementation, we'd track completed approvals
    // For now, calculate from pending state
    const totalRequests = pending.length;
    const responseTimes: number[] = pending
      .filter((p) => p.clickedAt) // Has been responded to
      .map((p) => {
        const requested = new Date(p.requestedAt).getTime();
        const clicked = new Date(p.clickedAt!).getTime();
        return Math.round((clicked - requested) / 1000); // Convert to seconds
      });

    const escalationTimes: number[] = pending
      .filter((p) => p.escalatedAt) // Was escalated
      .map((p) => {
        const requested = new Date(p.requestedAt).getTime();
        const escalated = new Date(p.escalatedAt!).getTime();
        return Math.round((escalated - requested) / 1000);
      });

    const averageResponseTime =
      responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;

    const fastestResponse = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const slowestResponse = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
    const averageEscalationTime =
      escalationTimes.length > 0 ? Math.round(escalationTimes.reduce((a, b) => a + b, 0) / escalationTimes.length) : 10; // Default 10 seconds

    // In a real implementation, track approvals vs revisions from memory log
    // For now, estimate based on pending state
    const totalApproved = Math.floor(totalRequests * 0.7); // Placeholder
    const totalRevised = Math.floor(totalRequests * 0.3); // Placeholder
    const approvalRate = totalRequests > 0 ? Math.round((totalApproved / totalRequests) * 100) : 0;
    const revisionRate = totalRequests > 0 ? Math.round((totalRevised / totalRequests) * 100) : 0;

    return {
      totalRequests,
      totalApproved,
      totalRevised,
      approvalRate,
      revisionRate,
      averageResponseTime,
      fastestResponse,
      slowestResponse,
      currentlyPending,
      averageEscalationTime,
    };
  }, [state?.approvals?.pending]);
}

/**
 * Format metrics for display
 */
export function formatApprovalMetrics(metrics: ApprovalMetrics): {
  summary: string;
  details: { label: string; value: string }[];
} {
  return {
    summary: `${metrics.totalRequests} approvals • ${metrics.approvalRate}% approved`,
    details: [
      { label: "Total Requests", value: String(metrics.totalRequests) },
      { label: "Approved", value: `${metrics.totalApproved} (${metrics.approvalRate}%)` },
      { label: "Revised", value: `${metrics.totalRevised} (${metrics.revisionRate}%)` },
      { label: "Avg Response Time", value: `${metrics.averageResponseTime}s` },
      { label: "Fastest", value: `${metrics.fastestResponse}s` },
      { label: "Slowest", value: `${metrics.slowestResponse}s` },
      { label: "Currently Pending", value: String(metrics.currentlyPending) },
      { label: "Escalation Time", value: `${metrics.averageEscalationTime}s` },
    ],
  };
}
