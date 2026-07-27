const sessionSelect = document.getElementById("session-select");
const attendanceList = document.getElementById("attendance-list");
const statPresent = document.getElementById("stat-present");
const statTotal = document.getElementById("stat-total");
const statRate = document.getElementById("stat-rate");
const exportBtn = document.getElementById("export-btn");

let refreshTimer = null;

async function loadSessions() {
  const res = await fetch("/api/sessions");
  const sessions = await res.json();

  if (sessions.length === 0) {
    sessionSelect.innerHTML = '<option value="">No sessions yet</option>';
    return;
  }

  sessionSelect.innerHTML = sessions
    .map((s) => `<option value="${s.id}">${s.name}</option>`)
    .join("");

  refreshData();
}

async function refreshData() {
  const sessionId = sessionSelect.value;
  if (!sessionId) return;

  const [attendanceRes, participantsRes] = await Promise.all([
    fetch(`/api/attendance/session/${sessionId}`),
    fetch("/api/participants"),
  ]);
  const attendance = await attendanceRes.json();
  const participants = await participantsRes.json();

  statPresent.textContent = attendance.length;
  statTotal.textContent = participants.length;
  statRate.textContent =
    participants.length > 0
      ? `${Math.round((attendance.length / participants.length) * 100)}%`
      : "0%";

  if (attendance.length === 0) {
    attendanceList.innerHTML = '<p class="empty-state">No check-ins yet for this session.</p>';
    return;
  }

  const rows = attendance
    .map(
      (a) => `
      <tr>
        <td>${a.participantName}</td>
        <td>${a.participantEmail}</td>
        <td>${new Date(a.timestamp).toLocaleTimeString()}</td>
      </tr>`
    )
    .join("");

  attendanceList.innerHTML = `
    <table>
      <tr><th>Name</th><th>Email</th><th>Checked in</th></tr>
      ${rows}
    </table>`;
}

sessionSelect.addEventListener("change", refreshData);

exportBtn.addEventListener("click", () => {
  const sessionId = sessionSelect.value;
  if (!sessionId) return;
  window.location.href = `/api/attendance/session/${sessionId}/export`;
});

loadSessions();
refreshTimer = setInterval(refreshData, 5000);
