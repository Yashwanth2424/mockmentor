import { test } from "node:test";
import assert from "node:assert/strict";
import {
      addDays,
      formatDate,
      formatDateTime,
      getZonedParts,
      zonedTimeToUtc,
} from "../src/lib/time.js";

test("Berlin winter time is UTC+1", () => {
      assert.equal(zonedTimeToUtc("2026-01-15", "10:00").toISOString(), "2026-01-15T09:00:00.000Z");
});

test("Berlin summer time is UTC+2", () => {
      assert.equal(zonedTimeToUtc("2026-07-15", "10:00").toISOString(), "2026-07-15T08:00:00.000Z");
});

test("handles the days the clocks change", () => {
      assert.equal(zonedTimeToUtc("2026-03-29", "12:00").toISOString(), "2026-03-29T10:00:00.000Z");
      assert.equal(zonedTimeToUtc("2026-10-25", "12:00").toISOString(), "2026-10-25T11:00:00.000Z");
});

test("late UTC evening is already the next day in Berlin", () => {
      const parts = getZonedParts(new Date("2026-09-01T23:30:00Z"));
      assert.equal(parts.dateString, "2026-09-02");
      assert.equal(parts.time, "01:30");
      assert.equal(parts.weekday, 3);
});

test("converting to UTC and back gives the same Berlin time", () => {
      const parts = getZonedParts(zonedTimeToUtc("2026-11-14", "12:00"));
      assert.equal(parts.dateString, "2026-11-14");
      assert.equal(parts.time, "12:00");
});

test("addDays moves across months and years", () => {
      assert.equal(addDays("2026-01-31", 1), "2026-02-01");
      assert.equal(addDays("2026-12-31", 1), "2027-01-01");
      assert.equal(addDays("2028-02-28", 1), "2028-02-29");
});

test("formatDateTime shows day month year in Berlin time", () => {
      assert.equal(formatDateTime("2026-10-13T07:30:00Z"), "13 Oct 2026, 09:30");
      assert.equal(formatDateTime("2026-01-05T23:00:00Z"), "6 Jan 2026, 00:00");
});

test("formatDate shows only the date", () => {
      assert.equal(formatDate("2026-09-01T23:30:00Z"), "2 Sep 2026");
});
