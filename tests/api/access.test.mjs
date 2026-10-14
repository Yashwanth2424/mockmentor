import { test, before } from "node:test";
import assert from "node:assert/strict";
import { api, berlinSlot, findMentor, newStudent, randomWeekdayDate } from "./helpers.mjs";

let studentA;
let studentB;
let interviewId;

before(async () => {
  studentA = await newStudent("Test Student A");
  studentB = await newStudent("Test Student B");

  const mentor = await findMentor(studentA);
  const res = await api("/api/interviews/book", {
    method: "POST",
    cookie: studentA,
    body: {
      topic: "Access Test",
      mentorId: mentor.id,
      date: berlinSlot(randomWeekdayDate(), "14:30"),
    },
  });

  assert.equal(res.status, 201);
  interviewId = res.json.data.id;
});

test("no login on /api/interviews returns 401", async () => {
  const res = await api("/api/interviews");
  assert.equal(res.status, 401);
});

test("a student calling an admin API gets 403", async () => {
  const res = await api("/api/admin/users", { cookie: studentA });
  assert.equal(res.status, 403);
});

test("a student cannot read another student's interview", async () => {
  const own = await api(`/api/interviews/${interviewId}`, { cookie: studentA });
  assert.equal(own.status, 200);

  const other = await api(`/api/interviews/${interviewId}`, { cookie: studentB });
  assert.equal(other.status, 403);
});

test("no password field in interview and mentor responses", async () => {
  for (const path of ["/api/interviews", "/api/mentor"]) {
    const res = await api(path, { cookie: studentA });
    assert.equal(res.status, 200);
    assert.ok(!JSON.stringify(res.json).includes('"password"'), `${path} leaks a password field`);
  }
});
