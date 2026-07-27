const sessionSelect = document.getElementById("session-select");
const scanStatus = document.getElementById("scan-status");
const cameraHint = document.getElementById("camera-hint");
const manualInput = document.getElementById("manual-id");
const manualSubmit = document.getElementById("manual-submit");

let scannerStarted = false;
let html5QrCode;

function showStatus(message, type) {
  scanStatus.innerHTML = `<div class="status-line status-${type}">${message}</div>`;
}

async function loadSessions() {
  const res = await fetch("/api/sessions");
  const sessions = await res.json();

  if (sessions.length === 0) {
    sessionSelect.innerHTML = '<option value="">No sessions yet &mdash; create one in Admin</option>';
    return;
  }

  sessionSelect.innerHTML = sessions
    .map((s) => `<option value="${s.id}">${s.name}</option>`)
    .join("");
}

async function markAttendance(participantId) {
  const sessionId = sessionSelect.value;
  if (!sessionId) {
    showStatus("Select a session first.", "warn");
    return;
  }

  try {
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, sessionId }),
    });
    const data = await res.json();

    if (data.status === "MARKED") {
      showStatus(`&#10003; ${data.participant.name} marked present for ${data.session.name}.`, "ok");
    } else if (data.status === "ALREADY_MARKED") {
      showStatus(`${data.participant.name} was already marked present at ${new Date(data.timestamp).toLocaleTimeString()}.`, "warn");
    } else if (data.status === "NOT_REGISTERED") {
      showStatus("This QR code does not match any registered participant.", "error");
    } else {
      showStatus(data.error || "Could not mark attendance.", "error");
    }
  } catch (err) {
    showStatus("Network error while marking attendance.", "error");
  }
}

function startScanner() {
  if (scannerStarted) return;
  cameraHint.style.display = "none";
  html5QrCode = new Html5Qrcode("reader");
  html5QrCode
    .start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 220 },
      (decodedText) => markAttendance(decodedText.trim())
    )
    .then(() => {
      scannerStarted = true;
    })
    .catch(() => {
      cameraHint.style.display = "block";
      cameraHint.textContent = "Camera unavailable. Use manual ID entry below instead.";
    });
}

manualSubmit.addEventListener("click", () => {
  const id = manualInput.value.trim();
  if (!id) {
    showStatus("Enter a participant ID first.", "warn");
    return;
  }
  markAttendance(id);
  manualInput.value = "";
});

sessionSelect.addEventListener("change", () => {
  if (sessionSelect.value) startScanner();
});

loadSessions();
