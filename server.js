const express = require("express");
const cors = require("cors");
const path = require("path");

const participantsRouter = require("./src/routes/participants");
const sessionsRouter = require("./src/routes/sessions");
const attendanceRouter = require("./src/routes/attendance");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/participants", participantsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/attendance", attendanceRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`IBM Z Summit Attendance System running at http://localhost:${PORT}`);
});
