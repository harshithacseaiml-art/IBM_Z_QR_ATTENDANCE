const express = require("express");
const { nanoid } = require("nanoid");
const { load, save } = require("../db");

const router = express.Router();

// POST /api/attendance - mark attendance for a participant in a session
// Body: { participantId, sessionId }
router.post("/", (req, res) => {
  const { participantId, sessionId } = req.body;

  if (!participantId || !sessionId) {
    return res.status(400).json({ error: "participantId and sessionId are required." });
  }

  const db = load();

  const participant = db.participants.find((p) => p.id === participantId);
  if (!participant) {
    return res.status(404).json({ status: "NOT_REGISTERED", error: "No participant found for this QR code." });
  }

  const session = db.sessions.find((s) => s.id === sessionId);
  if (!session) {
    return res.status(404).json({ status: "INVALID_SESSION", error: "Session not found." });
  }

  const alreadyMarked = db.attendance.find(
    (a) => a.participantId === participantId && a.sessionId === sessionId
  );
  if (alreadyMarked) {
    return res.status(200).json({
      status: "ALREADY_MARKED",
      participant,
      session,
      timestamp: alreadyMarked.timestamp,
    });
  }

  const record = {
    id: nanoid(10),
    participantId,
    sessionId,
    timestamp: new Date().toISOString(),
  };
  db.attendance.push(record);
  save(db);

  res.status(201).json({ status: "MARKED", participant, session, timestamp: record.timestamp });
});

// GET /api/attendance/session/:sessionId - list attendance for a session (for dashboard)
router.get("/session/:sessionId", (req, res) => {
  const db = load();
  const records = db.attendance
    .filter((a) => a.sessionId === req.params.sessionId)
    .map((a) => {
      const participant = db.participants.find((p) => p.id === a.participantId);
      return {
        ...a,
        participantName: participant ? participant.name : "Unknown",
        participantEmail: participant ? participant.email : "",
      };
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json(records);
});

// GET /api/attendance/session/:sessionId/export - export attendance as CSV
router.get("/session/:sessionId/export", (req, res) => {
  const db = load();
  const session = db.sessions.find((s) => s.id === req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: "Session not found." });
  }

  const records = db.attendance.filter((a) => a.sessionId === req.params.sessionId);

  let csv = "Name,Email,College,Timestamp\n";
  records.forEach((a) => {
    const p = db.participants.find((p) => p.id === a.participantId);
    if (!p) return;
    csv += `"${p.name}","${p.email}","${p.college}","${a.timestamp}"\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${session.name.replace(/\s+/g, "_")}_attendance.csv"`
  );
  res.send(csv);
});

module.exports = router;
