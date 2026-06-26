const test = require("node:test");
const assert = require("node:assert/strict");
const {
  hashPassword,
  isLegacyPlaintextMatch,
  isPasswordHash,
  stripPassword,
  validatePasswordPolicy,
  verifyPassword,
} = require("../utils/passwords");

test("hashPassword genera hashes bcrypt verificables", () => {
  const hash = hashPassword("123456");

  assert.equal(isPasswordHash(hash), true);
  assert.equal(hash.includes("123456"), false);
  assert.equal(verifyPassword("123456", hash), true);
  assert.equal(verifyPassword("otra", hash), false);
});

test("isLegacyPlaintextMatch permite migrar contrasenas antiguas solo si coinciden", () => {
  assert.equal(isLegacyPlaintextMatch("123456", "123456"), true);
  assert.equal(isLegacyPlaintextMatch("123456", "000000"), false);
  assert.equal(isLegacyPlaintextMatch("123456", hashPassword("123456")), false);
});

test("stripPassword evita guardar hashes en la sesion", () => {
  assert.deepEqual(stripPassword({ id: 1, correo: "a@b.cl", password: "hash" }), {
    id: 1,
    correo: "a@b.cl",
  });
});

test("validatePasswordPolicy exige longitud y complejidad minima", () => {
  assert.equal(validatePasswordPolicy("Abcdef12!a"), true);
  assert.equal(validatePasswordPolicy("abc123!"), false);
  assert.equal(validatePasswordPolicy("ABCDEFGHIJ"), false);
  assert.equal(validatePasswordPolicy("Abcdefghi"), false);
  assert.equal(validatePasswordPolicy("Abcdef12"), false);
});
