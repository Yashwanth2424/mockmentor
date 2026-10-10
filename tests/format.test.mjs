import { test } from "node:test";
import assert from "node:assert/strict";
import { capitalizeWords } from "../src/lib/format.js";

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
