import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingConfirmationEmail } from "../src/lib/emailTemplates.js";

const base = {
  topic: "React",
  date: "14 Oct 2026, 10:00",
  mentorName: "Akshay",
  appUrl: "https://example.com",
};

test("booking email contains the topic, date and mentor", () => {
  const html = bookingConfirmationEmail(base);
  assert.ok(html.includes("React"));
  assert.ok(html.includes("14 Oct 2026, 10:00"));
  assert.ok(html.includes("Akshay"));
  assert.ok(html.includes('href="https://example.com/dashboard"'));
});

test("booking email escapes HTML in user input", () => {
  const html = bookingConfirmationEmail({
    ...base,
    topic: "<script>alert(1)</script>",
    mentorName: '<a href="https://evil.example">Mentor</a>',
  });
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(!html.includes('evil.example">'));
  assert.ok(html.includes("&lt;a href=&quot;https://evil.example&quot;&gt;Mentor&lt;/a&gt;"));
});
