const bcrypt = require("bcryptjs");

const DEFAULT_SALT_ROUNDS = 12;

function getSaltRounds() {
  const configuredRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "", 10);
  return Number.isInteger(configuredRounds) && configuredRounds >= 10
    ? configuredRounds
    : DEFAULT_SALT_ROUNDS;
}

function isPasswordHash(value) {
  return typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);
}

function hashPassword(password) {
  return bcrypt.hashSync(String(password), getSaltRounds());
}

function verifyPassword(password, storedPassword) {
  if (!password || !storedPassword || !isPasswordHash(storedPassword)) {
    return false;
  }

  return bcrypt.compareSync(String(password), storedPassword);
}

function isLegacyPlaintextMatch(password, storedPassword) {
  return Boolean(
    password &&
      storedPassword &&
      !isPasswordHash(storedPassword) &&
      String(password) === String(storedPassword)
  );
}

function stripPassword(record) {
  if (!record) return null;
  const { password, ...safeRecord } = record;
  return safeRecord;
}

function validatePasswordPolicy(password) {
  if (typeof password !== "string") return false;
  const value = password.trim();
  if (value.length < 10) return false;
  if (!/[A-Z]/.test(value)) return false;
  if (!/[a-z]/.test(value)) return false;
  if (!/\d/.test(value)) return false;
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) return false;
  return true;
}

module.exports = {
  hashPassword,
  isLegacyPlaintextMatch,
  isPasswordHash,
  stripPassword,
  validatePasswordPolicy,
  verifyPassword,
};
