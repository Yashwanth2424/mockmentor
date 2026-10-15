import { test } from "node:test";
import assert from "node:assert/strict";
import { completeSchema } from "../src/lib/validators.js";

const valid = { rating: 4, feedback: "  Clear answers  ", strengths: " React ", improvements: "" };

function firstError(input) {
  const result = completeSchema.safeParse(input);
  assert.equal(result.success, false);
  return result.error.issues[0].message;
}

test("accepts valid feedback and trims the text", () => {
  const result = completeSchema.safeParse(valid);
  assert.equal(result.success, true);
  assert.equal(result.data.feedback, "Clear answers");
  assert.equal(result.data.strengths, "React");
});

test("strengths and improvements are optional", () => {
  assert.equal(completeSchema.safeParse({ rating: 5, feedback: "Good job" }).success, true);
});

test("rejects a rating that is not a whole number from 1 to 5", () => {
  for (const rating of [0, 6, 4.5, "5", undefined]) {
    assert.equal(firstError({ ...valid, rating }), "Rating must be between 1 and 5");
  }
});

test("rejects feedback that is too short after trimming", () => {
  assert.equal(
    firstError({ ...valid, feedback: "   ok   " }),
    "Feedback must be at least 5 characters",
  );
  assert.equal(
    firstError({ ...valid, feedback: undefined }),
    "Feedback must be at least 5 characters",
  );
});

test("rejects text that is too long", () => {
  const long = "a".repeat(1001);
  assert.equal(firstError({ ...valid, feedback: long }), "Feedback too long");
  assert.equal(firstError({ ...valid, strengths: long }), "Strengths too long");
  assert.equal(firstError({ ...valid, improvements: long }), "Improvements too long");
});
