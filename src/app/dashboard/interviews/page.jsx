"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

import SkeletonInterviewCard
      from "@/components/skeletons/SkeletonInterviewCard";

import "./interviews.css";

export default function InterviewsPage() {

      const router = useRouter();

      const [loadingId, setLoadingId] =
            useState(null);

      const [showModal, setShowModal] =
            useState(false);

      const [selectedInterview,
            setSelectedInterview] =
            useState(null);

      const [selectedDate,
            setSelectedDate] =
            useState("");

      const [selectedMentor,
            setSelectedMentor] =
            useState("");

      const [selectedTime,
            setSelectedTime] =
            useState("");

      const [rescheduling,
            setRescheduling] =
            useState(false);

      // FETCHER

      const fetcher = async (url) => {

            const res = await fetch(url);

            if (!res.ok) {
                  throw new Error(
                        "Failed to fetch"
                  );
            }

            return res.json();
      };

      // INTERVIEWS

      const {
            data: interviews,
            isLoading,
            error,
            mutate,
      } = useSWR(
            "/api/interviews",
            fetcher
      );

      // MENTORS

      const {
            data: mentors = [],
      } = useSWR(
            "/api/mentor",
            fetcher
      );

      const safeInterviews =
            Array.isArray(interviews)
                  ? interviews
                  : [];

      // CANCEL

      async function handleCancel(id) {

            const confirmCancel = confirm(
                  "Are you sure you want to cancel this interview?"
            );

            if (!confirmCancel) return;

            try {

                  setLoadingId(id);

                  const res = await fetch(
                        `/api/interviews/${id}/cancel`,
                        {
                              method: "PATCH",
                        }
                  );

                  const data =
                        await res.json();

                  if (!res.ok) {

                        toast.error(
                              data.error ||
                              "Failed to cancel"
                        );

                        return;
                  }

                  toast.success(
                        "Interview cancelled"
                  );

                  mutate();

            } catch {

                  toast.error(
                        "Something went wrong"
                  );

            } finally {

                  setLoadingId(null);
            }
      }

      // OPEN RESCHEDULE

      function openRescheduleModal(
            interview
      ) {

            setSelectedInterview(
                  interview
            );

            setSelectedDate(
                  new Date(interview.date)
                        .toISOString()
                        .split("T")[0]
            );

            setSelectedMentor(
                  interview.mentorId || ""
            );

            setSelectedTime(
                  new Date(interview.date)
                        .toTimeString()
                        .slice(0, 5)
            );

            setShowModal(true);
      }

      // CLOSE MODAL

      function closeModal() {

            setShowModal(false);

            setSelectedInterview(null);

            setSelectedDate("");

            setSelectedMentor("");

            setSelectedTime("");
      }

      // AVAILABLE MENTORS

      function getAvailableMentors() {

            if (!selectedDate) {
                  return mentors;
            }

            const selectedDay =
                  new Date(
                        `${selectedDate}T12:00:00`
                  ).getDay();

            return mentors.filter(
                  (mentor) =>
                        mentor.availability?.some(
                              (a) =>
                                    Number(
                                          a.dayOfWeek
                                    ) ===
                                    selectedDay
                        )
            );
      }

      // TIME SLOTS

      function getBookedSlots() {

            if (
                  !selectedDate ||
                  !selectedMentor
            ) {
                  return [];
            }

            return safeInterviews
                  .filter((interview) => {

                        // exclude current interview
                        if (
                              interview.id ===
                              selectedInterview?.id
                        ) {
                              return false;
                        }

                        const interviewDate =
                              new Date(
                                    interview.date
                              );

                        return (
                              interviewDate
                                    .toISOString()
                                    .split("T")[0] ===
                              selectedDate &&
                              interview.mentorId ===
                              selectedMentor &&
                              interview.status !==
                              "CANCELLED"
                        );
                  })
                  .map((interview) => {

                        const date =
                              new Date(
                                    interview.date
                              );

                        return date
                              .toTimeString()
                              .slice(0, 5);
                  });
      }

      function generateTimeSlots() {

            const mentor =
                  mentors.find(
                        (m) =>
                              m.id ===
                              selectedMentor
                  );

            if (
                  !mentor ||
                  !selectedDate
            ) {
                  return [];
            }

            const selectedDay =
                  new Date(
                        `${selectedDate}T12:00:00`
                  ).getDay();

            const availability =
                  mentor.availability?.find(
                        (a) =>
                              Number(
                                    a.dayOfWeek
                              ) ===
                              selectedDay
                  );

            if (!availability) {
                  return [];
            }

            const allSlots = [];

            for (
                  let hour =
                        availability.startHour;

                  hour <
                  availability.endHour;

                  hour++
            ) {

                  allSlots.push(
                        `${hour
                              .toString()
                              .padStart(2, "0")}:00`
                  );

                  allSlots.push(
                        `${hour
                              .toString()
                              .padStart(2, "0")}:30`
                  );
            }

            const bookedSlots =
                  getBookedSlots();

            return allSlots.filter(
                  (slot) =>
                        !bookedSlots.includes(
                              slot
                        )
            );
      }

      // RESCHEDULE

      async function handleReschedule() {

            if (
                  !selectedDate ||
                  !selectedMentor ||
                  !selectedTime
            ) {

                  toast.error(
                        "Please complete all fields"
                  );

                  return;
            }

            try {

                  setRescheduling(true);

                  const fullDate =
                        new Date(
                              `${selectedDate}T${selectedTime}:00`
                        );

                  const res =
                        await fetch(
                              `/api/interviews/${selectedInterview.id}/reschedule`,
                              {
                                    method:
                                          "PATCH",

                                    headers: {
                                          "Content-Type":
                                                "application/json",
                                    },

                                    body: JSON.stringify(
                                          {
                                                date:
                                                      fullDate,
                                                mentorId:
                                                      selectedMentor,
                                          }
                                    ),
                              }
                        );

                  const data =
                        await res.json();

                  if (!res.ok) {

                        toast.error(
                              data.error ||
                              "Failed to reschedule"
                        );

                        return;
                  }

                  toast.success(
                        "Interview rescheduled"
                  );

                  closeModal();

                  mutate();

            } catch {

                  toast.error(
                        "Something went wrong"
                  );

            } finally {

                  setRescheduling(false);
            }
      }

      return (
            <section className="interviews-page">

                  {/* HEADER */}

                  <div className="interviews-header">
                        <div>
                              <h1>
                                    My Interviews
                              </h1>

                              <p>
                                    Manage your scheduled
                                    mock interviews
                              </p>
                        </div>
                  </div>

                  {/* LOADING */}

                  {isLoading ? (

                        <div className="interview-grid">
                              {Array(6)
                                    .fill(0)
                                    .map((_, i) => (
                                          <SkeletonInterviewCard
                                                key={i}
                                          />
                                    ))}
                        </div>

                  ) : error ? (

                        <div className="empty-state">
                              <h3>
                                    Failed to load interviews
                              </h3>

                              <p>
                                    Please refresh the page
                              </p>
                        </div>

                  ) : safeInterviews.length === 0 ? (

                        <div className="empty-state">
                              <h3>
                                    No interviews yet
                              </h3>

                              <p>
                                    Start by booking your first mock interview
                              </p>
                        </div>

                  ) : (

                        <div className="interview-grid">

                              {safeInterviews.map((i) => (

                                    <div
                                          key={i.id}
                                          className="interview-card"
                                          onClick={() =>
                                                router.push(
                                                      `/dashboard/interviews/${i.id}`
                                                )
                                          }
                                    >

                                          <div className="card-top">

                                                <h3 className="card-title">
                                                      {i.topic}
                                                </h3>

                                                <span
                                                      className={`status-badge status-${i.status?.toLowerCase()}`}
                                                >
                                                      {i.status}
                                                </span>
                                          </div>

                                          <div className="card-body">

                                                <p className="card-text">
                                                      <strong>Date:</strong>{" "}

                                                      {new Date(
                                                            i.date
                                                      ).toLocaleString()}
                                                </p>

                                                <p className="card-text">
                                                      <strong>Mentor:</strong>{" "}

                                                      {i.mentor?.name ||
                                                            "Not assigned"}
                                                </p>

                                                <p className="card-text">
                                                      <strong>Email:</strong>{" "}

                                                      {i.mentor?.email ||
                                                            "N/A"}
                                                </p>
                                          </div>

                                          <div className="card-actions">

                                                {[
                                                      "PENDING",
                                                      "ACCEPTED",
                                                ].includes(
                                                      i.status
                                                ) && (
                                                            <>
                                                                  <button
                                                                        className="cancel-btn"
                                                                        disabled={
                                                                              loadingId === i.id
                                                                        }
                                                                        onClick={(e) => {

                                                                              e.stopPropagation();

                                                                              handleCancel(
                                                                                    i.id
                                                                              );
                                                                        }}
                                                                  >
                                                                        {loadingId === i.id
                                                                              ? "Cancelling..."
                                                                              : "Cancel"}
                                                                  </button>

                                                                  <button
                                                                        className="reschedule-btn"
                                                                        onClick={(e) => {

                                                                              e.stopPropagation();

                                                                              openRescheduleModal(
                                                                                    i
                                                                              );
                                                                        }}
                                                                  >
                                                                        Reschedule
                                                                  </button>
                                                            </>
                                                      )}

                                                <button
                                                      className="view-btn"
                                                      onClick={(e) => {

                                                            e.stopPropagation();

                                                            router.push(
                                                                  `/dashboard/interviews/${i.id}`
                                                            );
                                                      }}
                                                >
                                                      View Details
                                                </button>
                                          </div>
                                    </div>
                              ))}
                        </div>
                  )}

                  {/* MODAL */}

                  {showModal && (
                        <div className="modal-overlay">

                              <div className="reschedule-modal">

                                    <h2>
                                          Reschedule Interview
                                    </h2>

                                    <div className="modal-group">

                                          <label>
                                                Select Date
                                          </label>

                                          <input
                                                type="date"
                                                value={
                                                      selectedDate
                                                }
                                                onChange={(e) =>
                                                      setSelectedDate(
                                                            e.target.value
                                                      )
                                                }
                                          />
                                    </div>

                                    <div className="modal-group">

                                          <label>
                                                Select Mentor
                                          </label>

                                          <select
                                                value={
                                                      selectedMentor
                                                }
                                                onChange={(e) => {

                                                      setSelectedMentor(
                                                            e.target.value
                                                      );

                                                      setSelectedTime(
                                                            ""
                                                      );
                                                }}
                                          >

                                                <option value="">
                                                      Select Mentor
                                                </option>

                                                {getAvailableMentors().map(
                                                      (mentor) => (
                                                            <option
                                                                  key={
                                                                        mentor.id
                                                                  }
                                                                  value={
                                                                        mentor.id
                                                                  }
                                                            >
                                                                  {
                                                                        mentor.name
                                                                  }
                                                            </option>
                                                      )
                                                )}
                                          </select>
                                    </div>

                                    <div className="modal-group">

                                          <label>
                                                Select Time
                                          </label>

                                          <div className="slots-grid">

                                                {generateTimeSlots().map(
                                                      (slot) => (
                                                            <button
                                                                  key={
                                                                        slot
                                                                  }
                                                                  type="button"
                                                                  className={`slot-btn ${selectedTime === slot
                                                                        ? "active-slot"
                                                                        : ""
                                                                        }`}
                                                                  onClick={() =>
                                                                        setSelectedTime(
                                                                              slot
                                                                        )
                                                                  }
                                                            >
                                                                  {
                                                                        slot
                                                                  }
                                                            </button>
                                                      )
                                                )}
                                          </div>
                                    </div>

                                    <div className="modal-actions">

                                          <button
                                                className="modal-cancel"
                                                onClick={
                                                      closeModal
                                                }
                                          >
                                                Close
                                          </button>

                                          <button
                                                className="modal-save"
                                                disabled={
                                                      rescheduling
                                                }
                                                onClick={
                                                      handleReschedule
                                                }
                                          >
                                                {rescheduling
                                                      ? "Saving..."
                                                      : "Save Changes"}
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}
            </section>
      );
}