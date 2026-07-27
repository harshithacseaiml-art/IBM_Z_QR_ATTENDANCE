/**
 * Minimal JSON-file data layer.
 *
 * Design note: For this prototype we intentionally use a flat JSON file
 * instead of a full database (Postgres/MongoDB etc). This keeps the project
 * dependency-free and easy to run anywhere with zero setup, which fits the
 * scope of a hackathon-style prototype. See README "Future Scope" for the
 * planned migration to a real database for production use at scale.
 */

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

function defaultData() {
  return {
    participants: [], // { id, name, email, college, createdAt }
    sessions: [],      // { id, name, createdAt }
    attendance: [],    // { id, participantId, sessionId, timestamp }
  };
}

function load() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    save(defaultData());
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Corrupt db.json, resetting to default.", err);
    const fresh = defaultData();
    save(fresh);
    return fresh;
  }
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
