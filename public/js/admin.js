const participantForm = document.getElementById("participant-form");
const participantStatus = document.getElementById("participant-status");
const qrResult = document.getElementById("qr-result");
const sessionForm = document.getElementById("session-form");
const sessionStatus = document.getElementById("session-status");
const participantList = document.getElementById("participant-list");

function showStatus(el, message, type) {
  el.innerHTML = `<div class="status-line status-${type}">${message}</div>`;
}

async function loadParticipants() {
  const res = await fetch("/api/participants");
  const participants = await res.json();

  if (participants.length === 0) {
    participantList.innerHTML = '<p class="empty-state">No participants registered yet.</p>';
    return;
  }

  const rows = participants
    .map(
      (p) => `
      <tr>
        <td>${p.name}</td>
        <td>${p.email}</td>
        <td>${p.college || "&mdash;"}</td>
        <td><a href="#" data-id="${p.id}" class="view-qr">View QR</a></td>
      </tr>`
    )
    .join("");

  participantList.innerHTML = `
    <table>
      <tr><th>Name</th><th>Email</th><th>College</th><th>QR</th></tr>
      ${rows}
    </table>`;

  document.querySelectorAll(".view-qr").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const res = await fetch(`/api/participants/${link.dataset.id}/qrcode`);
      const data = await res.json();
      renderQr(data.participant, data.qrCode);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderQr(participant, qrDataUrl) {
  qrResult.innerHTML = `
    <div class="qr-box">
      <img src="${qrDataUrl}" alt="QR code for ${participant.name}" />
      <p style="margin:10px 0 2px; font-weight:600;">${participant.name}</p>
      <p style="margin:0; font-size:12.5px; color:#6b7280;">ID: ${participant.id}</p>
      <a href="${qrDataUrl}" download="${participant.name.replace(/\s+/g, "_")}_qrcode.png">
        <button type="button" class="secondary" style="margin-top:10px;">Download QR</button>
      </a>
    </div>`;
}

participantForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const college = document.getElementById("college").value.trim();

  try {
    const res = await fetch("/api/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, college }),
    });
    const data = await res.json();

    if (!res.ok) {
      showStatus(participantStatus, data.error || "Something went wrong.", "error");
      return;
    }

    showStatus(participantStatus, `Registered ${data.participant.name} successfully.`, "ok");
    renderQr(data.participant, data.qrCode);
    participantForm.reset();
    loadParticipants();
  } catch (err) {
    showStatus(participantStatus, "Network error &mdash; is the server running?", "error");
  }
});

sessionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("session-name").value.trim();

  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();

  if (!res.ok) {
    showStatus(sessionStatus, data.error || "Something went wrong.", "error");
    return;
  }

  showStatus(sessionStatus, `Session "${data.name}" created.`, "ok");
  sessionForm.reset();
});

loadParticipants();
