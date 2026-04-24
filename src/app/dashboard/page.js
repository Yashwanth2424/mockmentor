"use client";

import SkeletonInterviewCard from "@/components/skeletons/SkeletonInterviewCard";
import ThemeToggle from "@/components/ThemeToggle";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "react-toastify";
import "./dashboard.css";

export default function Dashboard() {

      const router = useRouter();

      const [selectedDate, setSelectedDate] = useState("");
      const [selectedTime, setSelectedTime] = useState("");
      const [topic, setTopic] = useState("");
      const [booking, setBooking] = useState(false);
      const [topicError, setTopicError] = useState("");

      async function handleCancel(id) {
            if (!confirm("Cancel this interview?")) return;

            const res = await fetch(`/api/interviews/${id}/cancel`, {
                  method: "PATCH",
            });

            if (res.ok) {
                  toast.success("Cancelled");
                  mutate();
            } else {
                  toast.error("Failed");
            }
      }

      const [rescheduleData, setRescheduleData] = useState(null);

      function openReschedule(interview) {
            setRescheduleData(interview);
      }

      async function handleReschedule() {
            if (!selectedDate || !selectedTime) {
                  toast.error("Select new date & time");
                  return;
            }

            const fullDateTime = new Date(`${selectedDate}T${selectedTime}`);

            const res = await fetch(
                  `/api/interviews/${rescheduleData.id}/reschedule`,
                  {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ date: fullDateTime }),
                  }
            );

            if (res.ok) {
                  toast.success("Rescheduled!");
                  setRescheduleData(null);
                  setSelectedDate("");
                  setSelectedTime("");
                  mutate();
            } else {
                  toast.error("Failed");
            }
      }

      // TIME SLOTS
      function generateTimeSlots() {
            const slots = [];
            for (let hour = 9; hour <= 17; hour++) {
                  slots.push(`${hour.toString().padStart(2, "0")}:00`);
                  slots.push(`${hour.toString().padStart(2, "0")}:30`);
            }
            return slots;
      }

      function isDayFullyBooked(date) {
            const totalSlots = generateTimeSlots().length;

            const booked = safeInterviews.filter((i) => {
                  const d = new Date(i.date);
                  return d.toISOString().split("T")[0] === date;
            }).length;

            return booked >= totalSlots;
      }

      function getMinDate() {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            return d.toISOString().split("T")[0];
      }

      const fetcher = (url) => fetch(url).then(res => res.json());

      const { data: interviews, isLoading: interviewsLoading, mutate } =
            useSWR("/api/interviews", fetcher);

      const { data: user, isLoading: userLoading } =
            useSWR("/api/me", fetcher);

      const safeInterviews = Array.isArray(interviews) ? interviews : [];

      function getBookedSlots() {
            if (!selectedDate || !safeInterviews.length) return [];

            return safeInterviews
                  .filter((i) => {
                        const d = new Date(i.date);
                        return d.toISOString().split("T")[0] === selectedDate;
                  })
                  .map((i) => {
                        const d = new Date(i.date);
                        return d.toTimeString().slice(0, 5);
                  });
      }

      function getSlotStats() {
            const totalSlots = generateTimeSlots().length;
            const booked = getBookedSlots().length;
            const available = totalSlots - booked;

            return { totalSlots, booked, available };
      }

      // BOOK INTERVIEW
      async function bookInterview() {

            if (!topic.trim()) {
                  setTopicError("Please enter interview topic");
                  return;
            }

            if (!selectedDate || !selectedTime) {
                  toast.error("Please select date and time");
                  return;
            }

            if (booking) return;

            setBooking(true);

            const formattedTopic =
                  topic.charAt(0).toUpperCase() + topic.slice(1);

            try {
                  const fullDateTime = new Date(`${selectedDate}T${selectedTime}`);

                  const res = await fetch("/api/interviews/book", {
                        method: "POST",
                        headers: {
                              "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                              topic: formattedTopic,
                              date: fullDateTime,
                        }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                        toast.error(data.error || "Booking failed");
                        return;
                  }

                  toast.success("Interview booked!");
                  mutate();

                  setTopic("");
                  setSelectedDate("");
                  setSelectedTime("");
                  setTopicError("");

            } catch (err) {
                  toast.error("Server error");
            } finally {
                  setBooking(false);
            }
      }

      async function handleLogout() {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
      }

      function formatTime(time) {
            const [hour, minute] = time.split(":");
            let h = parseInt(hour);
            const ampm = h >= 12 ? "PM" : "AM";

            h = h % 12 || 12;

            return `${h.toString().padStart(2, "0")}:${minute} ${ampm}`;
      }

      return (
            <div>

                  {/* NAVBAR */}
                  <nav className="navbar">
                        <div className="nav-left">MockMentor</div>

                        <div className="nav-right">
                              <span className="user-badge">
                                    {userLoading ? "Loading..." : user?.name}
                              </span>

                              <button onClick={handleLogout} className="logout-btn">
                                    Logout
                              </button>

                              <ThemeToggle />
                        </div>
                  </nav>

                  <div className="dashboard-container">

                        <header className="dashboard-header">
                              <h1>Dashboard</h1>
                              <p>Manage your mock interviews</p>
                        </header>

                        {/* ================= BOOK ================= */}
                        <section className="card booking-card">
                              <h2>Book New Interview</h2>

                              <div className={`booking-layout ${selectedDate ? "has-slots" : ""}`}>

                                    {/* LEFT */}
                                    <div className="booking-left">

                                          <div className="input-group">
                                                <input
                                                      placeholder="Interview topic"
                                                      value={topic}
                                                      onChange={(e) => {
                                                            setTopic(e.target.value);
                                                            setTopicError("");
                                                      }}
                                                      onBlur={() => {
                                                            if (topic) {
                                                                  setTopic(topic.charAt(0).toUpperCase() + topic.slice(1));
                                                            }
                                                      }}
                                                      className={topicError ? "input-error" : ""}
                                                />
                                                {topicError && <p className="error-text">{topicError}</p>}
                                          </div>

                                          <input
                                                type="date"
                                                value={selectedDate}
                                                min={getMinDate()}
                                                onChange={(e) => {
                                                      const selected = e.target.value;

                                                      if (!topic.trim()) {
                                                            setTopicError("Please enter interview topic first");
                                                            return;
                                                      }

                                                      if (isDayFullyBooked(selected)) {
                                                            toast.error("This day is fully booked");
                                                            return;
                                                      }

                                                      setSelectedDate(selected);
                                                      setSelectedTime("");
                                                }}
                                          />

                                          <button onClick={bookInterview} disabled={booking}>
                                                {booking ? "Booking..." : "Book Interview"}
                                          </button>

                                    </div>

                                    {/* RIGHT */}
                                    {selectedDate && (
                                          <div className="booking-right">

                                                {isDayFullyBooked(selectedDate) ? (
                                                      <div className="fully-booked">
                                                            🚫 Fully Booked
                                                            <p>Please select another date</p>
                                                      </div>
                                                ) : (
                                                      <>
                                                            <p className="slots-title">Select Time</p>

                                                            {/* SLOT STATS */}
                                                            {(() => {
                                                                  const stats = getSlotStats();
                                                                  return (
                                                                        <p className={`slots-info ${stats.available <= 3 ? "danger" : ""}`}>
                                                                              {stats.available} / {stats.totalSlots} slots available
                                                                        </p>
                                                                  );
                                                            })()}

                                                            {/* SELECTED SLOT */}
                                                            {selectedTime && (
                                                                  <p className="selected-slot">
                                                                        Selected: {new Date(selectedDate).toLocaleDateString()} • {formatTime(selectedTime)}
                                                                  </p>
                                                            )}

                                                            {/* SLOTS */}
                                                            <div className="slots-grid">
                                                                  {(() => {
                                                                        const bookedSlots = getBookedSlots(); // ✅ compute once

                                                                        return generateTimeSlots().map((time) => {
                                                                              const isBooked = bookedSlots.includes(time);

                                                                              return (
                                                                                    <button
                                                                                          key={time}
                                                                                          type="button"
                                                                                          disabled={isBooked}
                                                                                          className={`slot 
                                                                                                ${selectedTime === time ? "active" : ""} 
                                                                                                ${isBooked ? "disabled" : ""}
                                                                                                `}
                                                                                          onClick={() => {
                                                                                                if (!isBooked) setSelectedTime(time);
                                                                                          }}
                                                                                    >
                                                                                          {formatTime(time)}
                                                                                    </button>
                                                                              );
                                                                        });
                                                                  })()}
                                                            </div>
                                                      </>
                                                )}
                                          </div>
                                    )}
                              </div>
                        </section>

                        {/* ================= INTERVIEWS ================= */}
                        <section className="card">
                              <h2>Your Interviews</h2>

                              {interviewsLoading ? (
                                    <div className="interview-grid">
                                          {Array(4).fill(0).map((_, i) => (
                                                <SkeletonInterviewCard key={i} />
                                          ))}
                                    </div>
                              ) : safeInterviews.length === 0 ? (
                                    <div className="empty-state">
                                          <h3>No interviews yet</h3>
                                          <p>Start by booking your first interview 🚀</p>
                                    </div>
                              ) : (
                                    <div className="interview-grid">
                                          {safeInterviews.map((i) => (
                                                <div
                                                      key={i.id}
                                                      className="interview-card"
                                                      onClick={() => router.push(`/dashboard/interviews/${i.id}`)}
                                                >
                                                      <h3>{i.topic}</h3>
                                                      <p>{new Date(i.date).toLocaleString()}</p>
                                                      <span className={`status ${i.status?.toLowerCase()}`}>
                                                            {i.status || "PENDING"}
                                                      </span>
                                                      <div className="card-actions">

                                                            {i.status !== "CANCELLED" && (
                                                                  <>
                                                                        <button
                                                                              className="cancel-btn"
                                                                              onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleCancel(i.id);
                                                                              }}
                                                                        >
                                                                              Cancel
                                                                        </button>

                                                                        <button
                                                                              className="reschedule-btn"
                                                                              onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    openReschedule(i);
                                                                              }}
                                                                        >
                                                                              Reschedule
                                                                        </button>
                                                                  </>
                                                            )}

                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              )}
                        </section>

                  </div>

                  {rescheduleData && (
                        <div className="modal-overlay">

                              <div className="modal">
                                    <h3>Reschedule Interview</h3>

                                    <input
                                          type="date"
                                          value={selectedDate}
                                          min={getMinDate()}
                                          onChange={(e) => setSelectedDate(e.target.value)}
                                    />

                                    <div className="slots-grid">
                                          {generateTimeSlots().map((time) => (
                                                <button
                                                      key={time}
                                                      className={`slot ${selectedTime === time ? "active" : ""}`}
                                                      onClick={() => setSelectedTime(time)}
                                                >
                                                      {formatTime(time)}
                                                </button>
                                          ))}
                                    </div>

                                    <div className="modal-actions">
                                          <button onClick={handleReschedule}>Save</button>
                                          <button onClick={() => setRescheduleData(null)}>Cancel</button>
                                    </div>
                              </div>

                        </div>
                  )}
            </div>


      );
}