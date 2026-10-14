import { test, before } from "node:test";
import assert from "node:assert/strict";
import { api, berlinSlot, findMentor, newStudent, randomWeekdayDate } from "./helpers.mjs";

let studentA;
let studentB;
let studentC;
let mentor;
let day;

before(async () => {
  studentA = await newStudent("Test Student A");
  studentB = await newStudent("Test Student B");
  studentC = await newStudent("Test Student C");
  mentor = await findMentor(studentA);
  day = randomWeekdayDate();
});

function book(cookie, time, topic = "System Design") {
  return api("/api/interviews/book", {
    method: "POST",
    cookie,
    body: { topic, mentorId: mentor.id, date: berlinSlot(day, time) },
  });
}

test("two students booking the same slot at once: one 201, one 409", async () => {
  const results = await Promise.all([book(studentA, "10:00"), book(studentB, "10:00")]);
  const statuses = results.map((r) => r.status).sort();

  assert.deepEqual(statuses, [201, 409]);
});

test("a cancelled slot can be booked again", async () => {
  const first = await book(studentC, "11:00");
  assert.equal(first.status, 201);

  const cancel = await api(`/api/interviews/${first.json.data.id}/cancel`, {
    method: "PATCH",
    cookie: studentC,
  });
  assert.equal(cancel.status, 200);

  const second = await book(studentB, "11:00");
  assert.equal(second.status, 201);
});

test("a topic that is too short is rejected with a clear message", async () => {
  const res = await book(studentA, "12:00", "ab");

  assert.equal(res.status, 400);
  assert.match(res.json.error, /at least 3 characters/);
});
