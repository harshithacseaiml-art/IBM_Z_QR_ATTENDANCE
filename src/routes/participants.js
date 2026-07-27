const express = require("express");
const { nanoid } = require("nanoid");
const QRCode = require("qrcode");
const { load, save } = require("../db");

const router = express.Router();

// GET /api/participants - list all participants
router.get("/", (req, res) => {
  const db = load();
  res.json(db.participants);
});

// POST /api/participants - register a new participant, returns participant + QR code
router.post("/", async (req, res) => {
  const { name, email, college } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  const db = load();

  const existing = db.participants.find(
    (p) => p.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    return res.status(409).json({ error: "A participant with this email is already registered." });
  }

  const participant = {
    id: nanoid(10),
    name,
    email,
    college: college || "",
    createdAt: new Date().toISOString(),
  };

  db.participants.push(participant);
  save(db);

  try {
    // Encode just the participant ID - kept small so it scans fast and reliably
    const qrDataUrl = await QRCode.toDataURL(participant.id, { width: 300, margin: 2 });
    res.status(201).json({ participant, qrCode: qrDataUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Participant saved, but QR generation failed." });
  }
});

// GET /api/participants/:id/qrcode - regenerate QR code for an existing participant
router.get("/:id/qrcode", async (req, res) => {
  const db = load();
  const participant = db.participants.find((p) => p.id === req.params.id);
  if (!participant) {
    return res.status(404).json({ error: "Participant not found." });
  }
  try {
    const qrDataUrl = await QRCode.toDataURL(participant.id, { width: 300, margin: 2 });
    res.json({ participant, qrCode: qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: "QR generation failed." });
  }
});

// GET /api/participants/:id - lookup single participant (used by scanner to confirm identity)
router.get("/:id", (req, res) => {
  const db = load();
  const participant = db.participants.find((p) => p.id === req.params.id);
  if (!participant) {
    return res.status(404).json({ error: "Participant not found." });
  }
  res.json(participant);
});

module.exports = router;
