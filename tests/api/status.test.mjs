import { test, before } from "node:test";
import assert from "node:assert/strict";
import {
  api,
  berlinSlot,
  findMentor,
  loginAsMentor,
  newStudent,
  randomWeekdayDate,
} from "./helpers.mjs";

let student;
let mentorCookie;
let mentor;
let day;

before(async () => {
  student = await newStudent("Test Student Status");
  mentorCookie = await loginAsMentor();
  mentor = await findMentor(student);
  day = randomWeekdayDate();
});

async function book(time) {
  const res = await api("/api/interviews/book", {
    method: "POST",
    cookie: student,
    body: { topic: "Status Rules", mentorId: mentor.id, date: berlinSlot(day, time) },
  });
  assert.equal(res.status, 201);
  return res.json.data.id;
}

test("student cancel and mentor reject at once: only one succeeds", async () => {
  const id = await book("14:00");

  const [cancel, reject] = await Promise.all([
    api(`/api/interviews/${id}/cancel`, { method: "PATCH", cookie: student }),
    api(`/api/mentor/interviews/${id}/reject`, { method: "PATCH", cookie: mentorCookie }),
  ]);

  assert.deepEqual([cancel.status, reject.status].sort(), [200, 409]);

  const final = await api(`/api/interviews/${id}`, { cookie: student });
  const expected = cancel.status === 200 ? "CANCELLED" : "REJECTED";
  assert.equal(final.json.data.status, expected);
});
