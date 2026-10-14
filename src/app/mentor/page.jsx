"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Header from "@/components/Header";
import SkeletonMentor from "@/components/skeletons/SkeletonMentor";
import { formatDateTime } from "@/lib/time";
import { fetcher } from "@/lib/fetcher";
import StatusBadge from "@/components/StatusBadge";
import { STATUS_LABELS } from "@/lib/interviewStatus";
import AvailabilityForm from "./AvailabilityForm";
import FeedbackModal from "./FeedbackModal";
import "./mentor.css";

export default function MentorPage() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState(null);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [feedbackModal, setFeedbackModal] = useState(null);

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/api/me");
        const json = await res.json();

        if (!res.ok || !json.success) {
          router.push("/login");
          return;
        }

        const userData = json.data;

        if (userData.role !== "MENTOR") {
          router.push("/dashboard");
          return;
        }

        setUser(userData);
      } catch {
        router.push("/login");
      }
    }

    checkUser();
  }, [router]);

  const {
    data: interviews,
    isLoading,
    error,
    mutate,
  } = useSWR(user ? "/api/mentor/interviews" : null, fetcher);

  const { data: savedAvailability, mutate: mutateAvailability } = useSWR(
    user ? "/api/mentor/availability" : null,
    fetcher,
  );

  async function handleAccept(id) {
    setLoadingId(id);

    try {
      const res = await fetch(`/api/mentor/interviews/${id}/accept`, {
        method: "PATCH",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to accept");
        return;
      }

      toast.success("Accepted");
      mutate();
    } catch {
      toast.error("Server error");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(id) {
    setLoadingId(id);

    try {
      const res = await fetch(`/api/mentor/interviews/${id}/reject`, {
        method: "PATCH",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to reject");
        return;
      }

      toast.success("Rejected");
      mutate();
    } catch {
      toast.error("Server error");
    } finally {
      setLoadingId(null);
    }
  }

  if (!user) return <SkeletonMentor />;

  const safeInterviews = Array.isArray(interviews) ? interviews : [];

  const filteredInterviews = safeInterviews.filter((i) =>
    filter === "ALL" ? true : i.status === filter,
  );

  return (
    <>
      <Header user={user} />

      <div className="mentor-container">
        <h1 className="mentor-title">Mentor Dashboard</h1>

        {savedAvailability ? (
          <AvailabilityForm initial={savedAvailability} onSaved={mutateAvailability} />
        ) : (
          <div className="availability-box">
            <h3>Set Weekly Availability</h3>
            <p>Loading availability...</p>
          </div>
        )}

        {isLoading ? (
          <div className="skeleton-mentor-grid">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="skeleton-mentor-card">
                  <div className="skeleton skeleton-mentor-card-title"></div>
                  <div className="skeleton skeleton-mentor-card-line"></div>
                  <div className="skeleton skeleton-mentor-card-line short"></div>
                  <div className="skeleton skeleton-mentor-status"></div>
                  <div className="skeleton skeleton-mentor-btn"></div>
                </div>
              ))}
          </div>
        ) : error ? (
          <div className="mentor-empty">
            <p>Failed to load interviews. Please refresh.</p>
          </div>
        ) : safeInterviews.length === 0 ? (
          <div className="mentor-empty">
            <p>No interviews assigned yet</p>
          </div>
        ) : (
          <>
            <div className="filter-tabs">
              {["ALL", ...Object.keys(STATUS_LABELS)].map((status) => (
                <button
                  key={status}
                  className={filter === status ? "active" : ""}
                  onClick={() => setFilter(status)}
                >
                  {STATUS_LABELS[status] ?? "All"}
                </button>
              ))}
            </div>

            <div className="mentor-grid">
              {filteredInterviews.length === 0 ? (
                <div className="mentor-empty">
                  <p>No interviews match this filter</p>
                </div>
              ) : (
                filteredInterviews.map((i) => (
                  <div key={i.id} className="mentor-card">
                    <h3 className="mentor-topic">{i.topic}</h3>

                    <p className="mentor-text">
                      <strong>Student:</strong> {i.user?.name || "N/A"}
                    </p>
                    <p className="mentor-text">
                      <strong>Email:</strong> {i.user?.email || "N/A"}
                    </p>
                    <p className="mentor-text">
                      <strong>Date:</strong> {formatDateTime(i.date)}
                    </p>
                    <p className="mentor-text">
                      <strong>Status:</strong>{" "}
                      <StatusBadge status={i.status} className="status-badge" />
                    </p>

                    {i.status === "PENDING" && (
                      <div className="action-buttons">
                        <button
                          className="btn btn-accept"
                          onClick={() => handleAccept(i.id)}
                          disabled={loadingId === i.id}
                        >
                          {loadingId === i.id ? "Accepting..." : "Accept"}
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() => handleReject(i.id)}
                          disabled={loadingId === i.id}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {i.status === "ACCEPTED" && (
                      <div className="action-buttons">
                        <button className="btn btn-complete" onClick={() => setFeedbackModal(i)}>
                          Complete Interview
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {feedbackModal && (
        <FeedbackModal
          interview={feedbackModal}
          onClose={() => setFeedbackModal(null)}
          onCompleted={() => {
            setFeedbackModal(null);
            mutate();
          }}
        />
      )}
    </>
  );
}
