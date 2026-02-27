import test from "node:test";
import assert from "node:assert/strict";
import { isValidUsername, normalizeUsername } from "../src/renderer/features/account/username.js";

test("isValidUsername accepts alphanumeric, underscore, and hyphen", () => {
  assert.equal(isValidUsername("thu_rein-01"), true);
});

test("isValidUsername rejects invalid characters and long input", () => {
  assert.equal(isValidUsername("thu rein"), false);
  assert.equal(isValidUsername("abc$123"), false);
  assert.equal(isValidUsername("a".repeat(21)), false);
});

test("normalizeUsername removes underscores and hyphens", () => {
  assert.equal(normalizeUsername("thu_rein-phyoe"), "thureinphyoe");
});
