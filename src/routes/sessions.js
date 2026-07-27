const express = require("express");
const { nanoid } = require("nanoid");
const { load, save } = require("../db");

const router = express.Router();

// GET /api/sessions - list all sessions (e.g. workshops, hackathon days)
router.get("/", (req, res) => {
  const db = load();
  res.json(db.sessions);
});

// POST /api/sessions - create a new session/event track
router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Session name is required." });
  }

  const db = load();
  const session = {
    id: nanoid(8),
    name,
    createdAt: new Date().toISOString(),
  };
  db.sessions.push(session);
  save(db);

  res.status(201).json(session);
});

module.exports = router;
