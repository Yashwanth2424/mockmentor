"use client";

import SkeletonInterviewCard from "@/components/skeletons/SkeletonInterviewCard";
import ThemeToggle from "@/components/ThemeToggle";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "react-toastify";

export default function Dashboard() {

      const router = useRouter();


      const [selectedDate, setSelectedDate] = useState("");
      const [selectedTime, setSelectedTime] = useState("");
      const [topic, setTopic] = useState("");
      const [booking, setBooking] = useState(false);
      const [topicError, setTopicError] = useState("");
      const [filter, setFilter] = useState("ALL");

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

      const [selectedMentor, setSelectedMentor] = useState("");


      const fetcher = (url) => fetch(url).then(res => res.json());

      const { data: mentors } = useSWR("/api/mentor", fetcher);

      const [rescheduleData, setRescheduleData] = useState(null);


      const { data: interviews, isLoading: interviewsLoading, mutate } =
            useSWR("/api/interviews", fetcher);

      const { data: user, isLoading: userLoading } =
            useSWR("/api/me", fetcher);

      useEffect(() => {
            if (userLoading) return;

            if (!user) {
                  router.push("/login");
                  return;
            }

            if (user.role === "MENTOR") {
                  router.push("/mentor");
                  return;
            }

            if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
                  router.push("/admin");
                  return;
            }

      }, [user, userLoading, router]);

      useEffect(() => {
            setSelectedMentor("");
            setSelectedTime("");
      }, [selectedDate]);

      useEffect(() => {
            if (!selectedMentor || !selectedDate) return;

            const slots = getAvailableSlots();

            if (slots.length > 0) {
                  setSelectedTime(slots[0]);
            } else {
                  setSelectedTime("");
            }
      }, [selectedMentor, selectedDate]);



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
            const mentor = mentors?.find(m => m.id === selectedMentor);

            if (!mentor || !selectedDate) return [];

            const day = new Date(selectedDate).getDay();

            const dayAvailability = mentor.availability?.find(
                  (a) => a.dayOfWeek === day
            );

            if (!dayAvailability) return [];

            const start = dayAvailability.startHour;
            const end = dayAvailability.endHour;

            const slots = [];

            for (let hour = start; hour < end; hour++) {
                  slots.push(`${hour.toString().padStart(2, "0")}:00`);
                  slots.push(`${hour.toString().padStart(2, "0")}:30`);
            }

            return slots;


      }

      const slots = generateTimeSlots();
      const hasSlots = slots.length > 0;

      function isDayFullyBooked(date) {
            if (!selectedMentor) return false;

            const slots = generateTimeSlots();

            if (!slots.length) return false;

            const booked = safeInterviews.filter((i) => {
                  const d = new Date(i.date);

                  return (
                        d.toISOString().split("T")[0] === date &&
                        i.mentorId === selectedMentor
                  );
            }).length;

            return booked >= slots.length;
      }

      function getMinDate() {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            return d.toISOString().split("T")[0];
      }



      const safeInterviews = Array.isArray(interviews) ? interviews : [];
      function getBookedSlots() {
            if (!selectedDate || !safeInterviews.length || !selectedMentor) return [];

            return safeInterviews
                  .filter((i) => {
                        const d = new Date(i.date);

                        return (
                              d.toISOString().split("T")[0] === selectedDate &&
                              i.mentorId === selectedMentor // ✅ FIX
                        );
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

            // 🔥 Validate once (no duplicates)
            if (!topic.trim()) {
                  setTopicError("Please enter interview topic");
                  return;
            }

            if (!selectedMentor) {
                  toast.error("Please select a mentor");
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
                              mentorId: selectedMentor, // ✅ important
                        }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                        toast.error(data.error || "Booking failed");
                        return;
                  }

                  toast.success("Interview booked!");
                  mutate();

                  // 🔥 Reset everything
                  setTopic("");
                  setSelectedDate("");
                  setSelectedTime("");
                  setSelectedMentor(""); // ✅ you missed this earlier
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

      const filteredInterviews = safeInterviews.filter((i) => {
            if (filter === "ALL") return true;
            return i.status === filter;
      });

      function getAvailableSlots() {
            const allSlots = generateTimeSlots();
            const bookedSlots = getBookedSlots();

            return allSlots.filter((slot) => !bookedSlots.includes(slot));
      }

      function getAvailableMentors() {
            if (!selectedDate || !mentors) return mentors || [];

            const day = new Date(selectedDate).getDay();

            return mentors.filter((mentor) => {
                  return mentor.availability?.some(
                        (a) => a.dayOfWeek === day
                  );
            });
      }

      function formatAvailability(availability) {
            if (!availability || availability.length === 0) {
                  return "No availability";
            }

            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            return availability
                  .slice(0, 2)
                  .map((a) => `${dayNames[a.dayOfWeek]}: ${a.startHour}-${a.endHour}`)
                  .join(", ") + (availability.length > 2 ? "..." : "");
      }

      function groupSlots(slots) {
            const groups = {
                  Morning: [],
                  Afternoon: [],
                  Evening: [],
            };

            slots.forEach((slot) => {
                  const hour = parseInt(slot.split(":")[0]);

                  if (hour < 12) {
                        groups.Morning.push(slot);
                  } else if (hour < 17) {
                        groups.Afternoon.push(slot);
                  } else {
                        groups.Evening.push(slot);
                  }
            });

            return groups;
      }
      const grouped = groupSlots(getAvailableSlots());



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

                              <div className="booking-layout">

                                    {/* LEFT PANEL */}
                                    <div className="booking-left">

                                          {/* TOPIC */}
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

                                          {/* DATE */}
                                          <div className="input-group">
                                                <label>Select Date</label>
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

                                                            setSelectedDate(selected);
                                                            setSelectedTime("");
                                                            setSelectedMentor("");
                                                      }}
                                                />
                                          </div>

                                          {/* MENTOR */}
                                          <div className="input-group">
                                                <label>Select Mentor</label>

                                                <select
                                                      disabled={!selectedDate}
                                                      value={selectedMentor}
                                                      onChange={(e) => {
                                                            setSelectedMentor(e.target.value);
                                                            setSelectedTime("");
                                                      }}
                                                      className="mentor-select"
                                                >
                                                      <option value="">Select Mentor</option>

                                                      {getAvailableMentors().map((m) => (
                                                            <option key={m.id} value={m.id} className="select-mentor-option">
                                                                  {m.name} ({formatAvailability(m.availability)})
                                                            </option>
                                                      ))}
                                                </select>

                                                {selectedDate && getAvailableMentors().length === 0 && (
                                                      <p className="error-text">No mentors available on this day</p>
                                                )}
                                          </div>

                                          {/* BOOK BUTTON */}
                                          <button
                                                onClick={bookInterview}
                                                disabled={
                                                      !topic.trim() ||
                                                      !selectedDate ||
                                                      !selectedMentor ||
                                                      !selectedTime ||
                                                      booking
                                                }
                                                className="primary-btn"
                                          >
                                                {booking ? "Booking..." : "Book Interview"}
                                          </button>

                                    </div>

                                    {/* RIGHT PANEL */}
                                    {selectedDate && selectedMentor && (
                                          <div className="booking-right">

                                                {/* NO AVAILABILITY */}
                                                {generateTimeSlots().length === 0 && (
                                                      <p className="error-text">
                                                            Mentor not available on this day
                                                      </p>
                                                )}

                                                {/* FULLY BOOKED */}
                                                {generateTimeSlots().length > 0 &&
                                                      getAvailableSlots().length === 0 && (
                                                            <div className="fully-booked">
                                                                  🚫 Fully Booked
                                                                  <p>Please choose another date</p>
                                                            </div>
                                                      )}

                                                {/* SLOTS */}
                                                {getAvailableSlots().length > 0 && (
                                                      <>
                                                            <p className="slots-title">Select Time</p>

                                                            <p className="slots-info">
                                                                  {getAvailableSlots().length} slots available
                                                            </p>

                                                            {selectedTime && (
                                                                  <p className="selected-slot">
                                                                        {new Date(selectedDate).toLocaleDateString()} •{" "}
                                                                        {formatTime(selectedTime)}
                                                                  </p>
                                                            )}

                                                            <div className="slots-container">
                                                                  {Object.entries(grouped).map(([label, slots]) => {
                                                                        if (slots.length === 0) return null;

                                                                        return (
                                                                              <div key={label} className="slot-group">
                                                                                    <p className="group-title">{label}</p>

                                                                                    <div className="slots-grid">
                                                                                          {slots.map((time) => (
                                                                                                <button
                                                                                                      key={time}
                                                                                                      className={`slot ${selectedTime === time ? "active" : ""}`}
                                                                                                      onClick={() => setSelectedTime(time)}
                                                                                                >
                                                                                                      {formatTime(time)}
                                                                                                </button>
                                                                                          ))}
                                                                                    </div>
                                                                              </div>
                                                                        );
                                                                  })}
                                                            </div>
                                                      </>
                                                )}

                                          </div>
                                    )}

                                    {/* HINT MESSAGE */}
                                    {selectedDate && !selectedMentor && (
                                          <div className="booking-right">
                                                <p className="hint-text">
                                                      Select a mentor to view available time slots
                                                </p>
                                          </div>
                                    )}

                              </div>
                        </section>

                        {/* ================= INTERVIEWS ================= */}
                        <section className="card">
                              <h2>Your Interviews</h2>

                              <div className="filter-bar">
                                    <button
                                          className={filter === "ALL" ? "active" : ""}
                                          onClick={() => setFilter("ALL")}
                                    >
                                          All
                                    </button>

                                    <button
                                          className={filter === "PENDING" ? "active" : ""}
                                          onClick={() => setFilter("PENDING")}
                                    >
                                          Pending
                                    </button>

                                    <button
                                          className={filter === "ACCEPTED" ? "active" : ""}
                                          onClick={() => setFilter("ACCEPTED")}
                                    >
                                          Accepted
                                    </button>

                                    <button
                                          className={filter === "REJECTED" ? "active" : ""}
                                          onClick={() => setFilter("REJECTED")}
                                    >
                                          Rejected
                                    </button>

                                    <button
                                          className={filter === "CANCELLED" ? "active" : ""}
                                          onClick={() => setFilter("CANCELLED")}
                                    >
                                          Cancelled
                                    </button>
                              </div>

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
                                          {filteredInterviews.map((i) => (
                                                <div
                                                      key={i.id}
                                                      className="interview-card"
                                                      onClick={() => router.push(`/dashboard/interviews/${i.id}`)}
                                                >
                                                      <h3 className="card-title">{i.topic}</h3>

                                                      <p className="card-text">
                                                            {new Date(i.date).toLocaleString()}
                                                      </p>

                                                      <p className="card-text">
                                                            <strong>Mentor:</strong>{" "}
                                                            {i.mentor ? i.mentor.name : "Not assigned"}
                                                      </p>

                                                      <p className="card-text">
                                                            <strong>Email:</strong> {i.mentor?.email || "N/A"}
                                                      </p>

                                                      {/* ✅ Single clean status */}
                                                      <span className={`status-badge status-${i.status?.toLowerCase()}`}>
                                                            {i.status || "PENDING"}
                                                      </span>

                                                      {/* Actions */}
                                                      {i.status !== "CANCELLED" && (
                                                            <div className="card-actions">
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
                                                            </div>
                                                      )}
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

                                    <select
                                          value={selectedMentor}
                                          onChange={(e) => setSelectedMentor(e.target.value)}
                                    >
                                          <option value="">Select Mentor</option>

                                          {mentors?.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                      {m.name}
                                                </option>
                                          ))}
                                    </select>

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