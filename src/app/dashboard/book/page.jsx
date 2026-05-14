"use client";
import SkeletonInterviewCard from "@/components/skeletons/SkeletonInterviewCard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR, {
      mutate as globalMutate,
} from "swr";

import { toast } from "react-toastify";
import "./book.css";
export default function BookPage() {

      const router = useRouter();

      const [selectedDate, setSelectedDate] = useState("");
      const [selectedTime, setSelectedTime] = useState("");
      const [selectedMentor, setSelectedMentor] = useState("");
      const [topic, setTopic] = useState("");
      const [booking, setBooking] = useState(false);
      const [topicError, setTopicError] = useState("");

      const fetcher = async (url) => {

            const res = await fetch(url);

            if (!res.ok) {

                  const errorText =
                        await res.text();

                  console.error(
                        `FETCH ERROR (${url}):`,
                        errorText
                  );

                  throw new Error(
                        `Failed to fetch ${url}`
                  );
            }

            return res.json();
      };
      const {
            data: mentors = [],
            isLoading: mentorsLoading,
      } = useSWR(
            "/api/mentor",
            fetcher,
            {
                  revalidateOnFocus: false,
            }
      );

      const {
            data: interviews,
            isLoading: interviewsLoading,
      } = useSWR("/api/interviews", fetcher);

      const {
            data: user,
            isLoading: userLoading,
      } = useSWR("/api/me", fetcher);

      const safeInterviews = Array.isArray(interviews)
            ? interviews
            : [];

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

            if (
                  user.role === "ADMIN" ||
                  user.role === "SUPER_ADMIN"
            ) {
                  router.push("/admin");
            }

      }, [user, userLoading, router]);

      useEffect(() => {
            setSelectedMentor("");
            setSelectedTime("");
      }, [selectedDate]);



      function getMinDate() {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            return d.toISOString().split("T")[0];
      }

      function formatTime(time) {
            const [hour, minute] = time.split(":");
            let h = parseInt(hour);
            const ampm = h >= 12 ? "PM" : "AM";
            h = h % 12 || 12;

            return `${h
                  .toString()
                  .padStart(2, "0")}:${minute} ${ampm}`;
      }

      function formatAvailability(availability) {
            if (!availability?.length) {
                  return "No availability";
            }

            const dayNames = [
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
            ];
            return (
                  availability
                        .slice(0, 2)
                        .map(
                              (a) =>
                                    `${dayNames[a.dayOfWeek]} ${a.startHour}-${a.endHour}`
                        )
                        .join(", ") +
                  (availability.length > 2 ? "..." : "")
            );
      }

      function generateTimeSlots() {
            const mentor = mentors?.find(
                  (m) => m.id === selectedMentor
            );

            if (!mentor || !selectedDate) {
                  return [];
            }

            const day = getSelectedDay(selectedDate);

            const dayAvailability =
                  mentor.availability?.find(
                        (a) => a.dayOfWeek === day
                  );

            if (!dayAvailability) {
                  return [];
            }

            const slots = [];

            for (
                  let hour = dayAvailability.startHour;
                  hour < dayAvailability.endHour;
                  hour++
            ) {
                  slots.push(
                        `${hour
                              .toString()
                              .padStart(2, "0")}:00`
                  );

                  slots.push(
                        `${hour
                              .toString()
                              .padStart(2, "0")}:30`
                  );
            }
            return slots;
      }

      function getBookedSlots() {

            if (
                  !selectedDate ||
                  !selectedMentor
            ) {
                  return [];
            }

            return safeInterviews
                  .filter((i) => {

                        const d = new Date(i.date);

                        return (
                              d.toISOString().split("T")[0] ===
                              selectedDate &&
                              i.mentorId === selectedMentor
                        );
                  })
                  .map((i) => {

                        const d = new Date(i.date);

                        return d
                              .toTimeString()
                              .slice(0, 5);
                  });
      }

      function getAvailableSlots() {

            const allSlots = generateTimeSlots();

            const bookedSlots = getBookedSlots();

            return allSlots.filter(
                  (slot) =>
                        !bookedSlots.includes(slot)
            );
      }

      function getSelectedDay(dateString) {

            const [
                  year,
                  month,
                  day,
            ] = dateString
                  .split("-")
                  .map(Number);

            return new Date(
                  year,
                  month - 1,
                  day
            ).getDay();
      }

      function getAvailableMentors() {

            if (!selectedDate) {
                  return mentors;
            }

            const selectedDay =
                  new Date(
                        `${selectedDate}T12:00:00`
                  ).getDay();

            return mentors.filter((mentor) =>
                  mentor.availability?.some(
                        (availability) =>
                              Number(
                                    availability.dayOfWeek
                              ) === selectedDay
                  )
            );
      }
      function groupSlots(slots) {
            const groups = {
                  Morning: [],
                  Afternoon: [],
                  Evening: [],
            };

            slots.forEach((slot) => {

                  const hour = parseInt(
                        slot.split(":")[0]
                  );

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

      async function bookInterview() {

            if (!topic.trim()) {
                  setTopicError(
                        "Please enter interview topic"
                  );
                  return;
            }

            if (!selectedDate) {
                  toast.error("Please select a date");
                  return;
            }

            if (!selectedMentor) {
                  toast.error("Please select a mentor");
                  return;
            }

            if (!selectedTime) {
                  toast.error("Please select a time slot");
                  return;
            }

            if (booking) return;

            setBooking(true);

            try {

                  const cleanTopic =
                        topic.trim();

                  const formattedTopic =
                        cleanTopic.charAt(0).toUpperCase() +
                        cleanTopic.slice(1);

                  const fullDateTime = new Date(
                        `${selectedDate}T${selectedTime}:00`
                  );

                  const res = await fetch(
                        "/api/interviews/book",
                        {
                              method: "POST",

                              headers: {
                                    "Content-Type":
                                          "application/json",
                              },
                              body: JSON.stringify({
                                    topic: formattedTopic,
                                    date: fullDateTime,
                                    mentorId: selectedMentor,
                              }),
                        }
                  );

                  const data = await res.json();
                  if (!res.ok) {

                        toast.error(
                              data.error ||
                              "Booking failed"
                        );
                        return;
                  }

                  toast.success(
                        "Interview booked successfully"
                  );

                  globalMutate("/api/interviews");

                  setTopic("");
                  setSelectedDate("");
                  setSelectedMentor("");
                  setSelectedTime("");
                  setTopicError("");

            } catch (err) {
                  toast.error(
                        "Something went wrong"
                  );

            } finally {
                  setBooking(false);
            }
      }

      if (
            userLoading ||
            interviewsLoading
      ) {
            return <SkeletonInterviewCard />;
      }

      const availableSlots =
            getAvailableSlots();
      const groupedSlots =
            groupSlots(availableSlots);

      return (
            <section>
                  <div className="book-page">
                        <div className="booking-page-title">
                              <h1>
                                    Book Interview
                              </h1>
                              <p>
                                    Schedule your next mock
                                    interview session
                              </p>
                        </div>

                        <div className="booking-card">
                              <div className="booking-layout">
                                    <div className="booking-left">
                                          <div className="input-group">
                                                <label>
                                                      Interview Topic
                                                </label>

                                                <input
                                                      type="text"
                                                      placeholder="Frontend Development, React, DSA..."
                                                      value={topic}
                                                      onChange={(e) => {

                                                            setTopic(
                                                                  e.target.value
                                                            );

                                                            setTopicError("");
                                                      }}
                                                />
                                                {topicError && (
                                                      <p className="error-text">
                                                            {topicError}
                                                      </p>
                                                )}

                                          </div>
                                          <div className="input-group">
                                                <label>
                                                      Select Date
                                                </label>
                                                <input
                                                      type="date"
                                                      value={selectedDate}
                                                      min={getMinDate()}
                                                      onChange={(e) =>
                                                            setSelectedDate(
                                                                  e.target.value
                                                            )
                                                      }
                                                />

                                          </div>
                                          <div className="input-group">
                                                <label>
                                                      Select Mentor
                                                </label>
                                                <select
                                                      disabled={!selectedDate}
                                                      value={
                                                            selectedMentor
                                                      }
                                                      onChange={(e) => {

                                                            setSelectedMentor(
                                                                  e.target.value
                                                            );

                                                            setSelectedTime("");
                                                      }}
                                                >
                                                      <option value="">
                                                            {mentorsLoading
                                                                  ? "Loading mentors..."
                                                                  : "Select Mentor"}
                                                      </option>

                                                      {getAvailableMentors().map(
                                                            (m) => (
                                                                  <option
                                                                        key={
                                                                              m.id
                                                                        }
                                                                        value={
                                                                              m.id
                                                                        }
                                                                  >
                                                                        {m.name} (
                                                                        {formatAvailability(
                                                                              m.availability
                                                                        )}
                                                                        )
                                                                  </option>
                                                            )
                                                      )}

                                                </select>
                                          </div>

                                          {selectedTime && (
                                                <div className="selected-slot">

                                                      Selected:
                                                      {" "}
                                                      {new Date(
                                                            selectedDate
                                                      ).toLocaleDateString()}
                                                      {" • "}
                                                      {formatTime(
                                                            selectedTime
                                                      )}

                                                </div>
                                          )}
                                          <button
                                                onClick={bookInterview}
                                                disabled={
                                                      booking ||
                                                      !topic.trim() ||
                                                      !selectedDate ||
                                                      !selectedMentor ||
                                                      !selectedTime
                                                }
                                          >
                                                {booking
                                                      ? "Booking..."
                                                      : "Book Interview"}

                                          </button>
                                    </div>

                                    <div className="booking-right">
                                          <h3 className="booking-right-title">
                                                Available Time Slots
                                          </h3>

                                          {!selectedDate ? (

                                                <div className="empty-slots">
                                                      Select a date to
                                                      view mentors and
                                                      slots
                                                </div>

                                          ) : !selectedMentor ? (

                                                <div className="empty-slots">
                                                      Select a mentor to
                                                      view available
                                                      slots
                                                </div>

                                          ) : availableSlots.length === 0 ? (

                                                <div className="empty-slots">
                                                      No slots available
                                                      for this mentor on
                                                      selected date
                                                </div>

                                          ) : (

                                                Object.entries(
                                                      groupedSlots
                                                ).map(
                                                      ([label, slots]) => {

                                                            if (
                                                                  !slots.length
                                                            ) {
                                                                  return null;
                                                            }

                                                            return (
                                                                  <div
                                                                        key={
                                                                              label
                                                                        }
                                                                        className="slot-group"
                                                                  >
                                                                        <p className="slot-group-title">
                                                                              {
                                                                                    label
                                                                              }
                                                                        </p>
                                                                        <div className="slots-grid">

                                                                              {slots.map(
                                                                                    (
                                                                                          time
                                                                                    ) => (
                                                                                          <button
                                                                                                key={
                                                                                                      time
                                                                                                }
                                                                                                type="button"
                                                                                                className={`slot ${selectedTime === time
                                                                                                      ? "active"
                                                                                                      : ""
                                                                                                      }`}
                                                                                                onClick={() =>
                                                                                                      setSelectedTime(
                                                                                                            time
                                                                                                      )
                                                                                                }
                                                                                          >
                                                                                                {formatTime(
                                                                                                      time
                                                                                                )}
                                                                                          </button>
                                                                                    )
                                                                              )}

                                                                        </div>

                                                                  </div>
                                                            );
                                                      }
                                                )
                                          )}

                                    </div>

                              </div>

                        </div>
                  </div>

            </section>
      );
}