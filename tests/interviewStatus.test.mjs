import { test } from "node:test";
import assert from "node:assert/strict";
import { TRANSITIONS, canTransition } from "../src/lib/interviewStatus.js";

const ALL = ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"];

function allowedFrom(action) {
  return ALL.filter((status) => canTransition(action, status));
}

test("a mentor can only accept or reject a pending interview", () => {
  assert.deepEqual(allowedFrom("accept"), ["PENDING"]);
  assert.deepEqual(allowedFrom("reject"), ["PENDING"]);
});

test("only an accepted interview can be completed", () => {
  assert.deepEqual(allowedFrom("complete"), ["ACCEPTED"]);
});

test("only pending or accepted interviews can be cancelled or rescheduled", () => {
  assert.deepEqual(allowedFrom("cancel"), ["PENDING", "ACCEPTED"]);
  assert.deepEqual(allowedFrom("reschedule"), ["PENDING", "ACCEPTED"]);
});

test("finished interviews cannot change any more", () => {
  for (const status of ["REJECTED", "COMPLETED", "CANCELLED"]) {
    for (const action of Object.keys(TRANSITIONS)) {
      assert.equal(canTransition(action, status), false, `${action} from ${status}`);
    }
  }
});

test("each action leads to the expected status", () => {
  assert.equal(TRANSITIONS.accept.to, "ACCEPTED");
  assert.equal(TRANSITIONS.reject.to, "REJECTED");
  assert.equal(TRANSITIONS.complete.to, "COMPLETED");
  assert.equal(TRANSITIONS.cancel.to, "CANCELLED");
  assert.equal(TRANSITIONS.reschedule.to, "PENDING");
});

test("unknown actions are never allowed", () => {
  assert.equal(canTransition("delete", "PENDING"), false);
});
