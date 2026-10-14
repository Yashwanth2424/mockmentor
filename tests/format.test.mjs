import { test } from "node:test";
import assert from "node:assert/strict";
import { capitalizeWords, escapeHtml } from "../src/lib/format.js";

test("capitalizes the first letter of every word", () => {
  assert.equal(capitalizeWords("react developer"), "React Developer");
});

test("keeps extra spaces as they are", () => {
  assert.equal(capitalizeWords("  data   structures"), "  Data   Structures");
});

test("works with letters like ü", () => {
  assert.equal(capitalizeWords("über cool"), "Über Cool");
});

test("does not lowercase existing capitals", () => {
  assert.equal(capitalizeWords("API design"), "API Design");
});

test("handles an empty string", () => {
  assert.equal(capitalizeWords(""), "");
});

test("escapeHtml replaces the five special characters", () => {
  assert.equal(
    escapeHtml(`<a href="x">Tom & Jerry's</a>`),
    "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;",
  );
});

test("escapeHtml leaves normal text unchanged", () => {
  assert.equal(escapeHtml("React Developer"), "React Developer");
});

test("escapeHtml handles empty values", () => {
  assert.equal(escapeHtml(undefined), "");
  assert.equal(escapeHtml(null), "");
});
