"use client";

import SkeletonDetails from "@/components/skeletons/SkeletonDetails";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "react-toastify";
import { formatDateTime } from "@/lib/time";
import { fetcher } from "@/lib/fetcher";
import StatusBadge from "@/components/StatusBadge";
import { canTransition } from "@/lib/interviewStatus";
import "./details.css";

export default function InterviewDetails() {
  const { id } = useParams();
  const router = useRouter();

  const {
    data: interview,
    isLoading,
    error,
    mutate,
  } = useSWR(id ? `/api/admin/interviews/${id}` : null, fetcher, { revalidateOnFocus: false });

  const [cancelling, setCancelling] = useState(false);

  async function cancelInterview() {
    if (cancelling) return;
    if (!confirm("Cancel this interview?")) return;

    setCancelling(true);

    try {
      const res = await fetch(`/api/admin/interviews/${id}/cancel`, { method: "PATCH" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Could not cancel");
        return;
      }

      toast.success("Interview cancelled");
      mutate();
    } catch {
      toast.error("Server error");
    } finally {
      setCancelling(false);
    }
  }

  if (isLoading) return <SkeletonDetails />;

  if (error || !interview) {
    return (
      <div className="admin-details">
        <button className="back-btn" onClick={() => router.push("/admin")}>
          ← Back to Admin
        </button>
        <div className="details-card">
          <h2>Interview not found</h2>
        </div>
      </div>
    );
  }

  const canCancel = canTransition("cancel", interview.status);

  return (
    <div className="admin-details">
      <button className="back-btn" onClick={() => router.push("/admin")}>
        ← Back to Admin
      </button>

      <h1>Interview Details</h1>

      <div className="details-card">
        <h2>{interview.topic}</h2>

        <p>
          <strong>Status:</strong> <StatusBadge status={interview.status} />
        </p>

        <p>
          <strong>Date:</strong> {interview.date ? formatDateTime(interview.date) : "N/A"} (German
          time)
        </p>

        <p>
          <strong>Student:</strong> {interview.user?.name} ({interview.user?.email})
        </p>

        <p>
          <strong>Mentor:</strong>{" "}
          {interview.mentor
            ? `${interview.mentor.name} (${interview.mentor.email})`
            : "Not assigned"}
        </p>

        <div className="feedback">
          <h3>Mentor Feedback</h3>

          {interview.status === "COMPLETED" && interview.feedback ? (
            <>
              {interview.rating && (
                <p>
                  <strong>Rating:</strong> {interview.rating} / 5
                </p>
              )}
              {interview.strengths && (
                <p>
                  <strong>Strengths:</strong> {interview.strengths}
                </p>
              )}
              {interview.improvements && (
                <p>
                  <strong>Areas to improve:</strong> {interview.improvements}
                </p>
              )}
              <p>
                <strong>Overall:</strong> {interview.feedback}
              </p>
            </>
          ) : (
            <p>The mentor adds feedback after completing the interview.</p>
          )}
        </div>

        {canCancel && (
          <div className="actions">
            <button className="cancel" disabled={cancelling} onClick={cancelInterview}>
              {cancelling ? "Cancelling..." : "Cancel Interview"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
