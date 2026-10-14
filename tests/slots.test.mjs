import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dayOfWeek,
  formatSlotTime,
  freeSlots,
  groupSlots,
  mentorsAvailableOn,
  takenTimes,
  timeSlotsFor,
} from "../src/lib/slots.js";

const MONDAY = "2026-10-19";
const mentor = { id: "m1", availability: [{ dayOfWeek: 1, startHour: 9, endHour: 11 }] };
const other = { id: "m2", availability: [{ dayOfWeek: 2, startHour: 9, endHour: 17 }] };

test("finds the day of the week for a date", () => {
  assert.equal(dayOfWeek(MONDAY), 1);
});

test("shows only mentors who work on that day", () => {
  assert.deepEqual(mentorsAvailableOn([mentor, other], MONDAY), [mentor]);
  assert.deepEqual(mentorsAvailableOn([mentor, other], ""), [mentor, other]);
});

test("makes half-hour slots inside the working hours", () => {
  assert.deepEqual(timeSlotsFor(mentor, MONDAY), ["09:00", "09:30", "10:00", "10:30"]);
});

test("has no slots when the mentor does not work that day", () => {
  assert.deepEqual(timeSlotsFor(other, MONDAY), []);
  assert.deepEqual(timeSlotsFor(undefined, MONDAY), []);
});

test("reads booked times in Berlin time, only for the chosen day", () => {
  const booked = ["2026-10-19T08:00:00.000Z", "2026-10-20T08:00:00.000Z"];
  assert.deepEqual(takenTimes(booked, MONDAY), ["10:00"]);
});

test("removes taken slots", () => {
  assert.deepEqual(freeSlots(["09:00", "09:30", "10:00"], ["09:30"]), ["09:00", "10:00"]);
});

test("shows slot times in 12-hour format", () => {
  assert.equal(formatSlotTime("09:30"), "09:30 AM");
  assert.equal(formatSlotTime("12:00"), "12:00 PM");
  assert.equal(formatSlotTime("16:30"), "04:30 PM");
});

test("groups slots into morning, afternoon and evening", () => {
  assert.deepEqual(groupSlots(["09:00", "12:00", "16:30", "17:00"]), {
    Morning: ["09:00"],
    Afternoon: ["12:00", "16:30"],
    Evening: ["17:00"],
  });
});
