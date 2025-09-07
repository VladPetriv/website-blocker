import { isWithInSessionTime } from "./common.js";
import { getRandomDisciplineMessage } from "./messages.js";

const SITES_STORAGE_KEY = "sites";
const SESSIONS_STORAGE_KEY = "sessions";
const DAY_SETTINGS_STORAGE_KEY = "daySettings";

const siteInput = document.getElementById("siteInput");
const addSiteBtn = document.getElementById("addSite");
const siteList = document.getElementById("siteList");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");
const addSessionBtn = document.getElementById("addSession");
const sessionList = document.getElementById("sessionList");
const saveButton = document.getElementById("saveButton");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const blockedCountEl = document.getElementById("blockedCount");

document.addEventListener("DOMContentLoaded", () => renderPage());

function renderPage() {
  // Get application settings from extension storage
  chrome.storage.sync.get(
    [SITES_STORAGE_KEY, SESSIONS_STORAGE_KEY, DAY_SETTINGS_STORAGE_KEY],
    (res) => {
      const storageResult = {};

      const initialSessions = structuredClone(res[SESSIONS_STORAGE_KEY]) || [];
      storageResult.sites = res[SITES_STORAGE_KEY] || [];
      storageResult.sessions = res[SESSIONS_STORAGE_KEY] || [];
      storageResult.initialSessions = initialSessions;
      storageResult.daySettings = res[DAY_SETTINGS_STORAGE_KEY] || [];

      // Render page content
      renderSites(storageResult.sites);
      updateBlockedCount(storageResult.sites.length);
      renderSessions(storageResult.sessions);
      renderSelectedDays(storageResult.daySettings);

      // Add event listeners
      addSiteBtn.addEventListener("click", () => {
        addSite(storageResult.sites);
      });
      siteInput.addEventListener("keypress", (e) =>
        e.key === "Enter" ? addSite(storageResult.sites) : null,
      );
      addSessionBtn.addEventListener("click", () => {
        addSession(storageResult.sessions);
      });

      saveButton.addEventListener("click", () => {
        const selectedDays = getSelectedDays();
        storageResult.daySettings = selectedDays;
        saveSettings(storageResult);
      });
    },
  );
}

function addSite(sites) {
  const site = siteInput.value.trim();

  if (site && !sites.includes(site)) {
    sites.push(site);
    renderSites(sites);

    siteInput.value = "";
    updateBlockedCount(sites.length);

    const newSiteItem = siteList.lastElementChild;
    if (newSiteItem) {
      newSiteItem.classList.add("fade-in");
    }
  }
}

function renderSites(sites) {
  siteList.innerHTML = sites
    .map(
      (site, index) => `
<div class="list-item">
  <div class="list-item-content">
    <span>🌐</span>
    <span>${site}</span>
  </div>
  <button id="remove-btn-site" class="remove-btn" data-index="${index}">✕</button>
</div>
    `,
    )
    .join("");

  document.querySelectorAll("#remove-btn-site").forEach((button) => {
    button.addEventListener("click", function () {
      removeSite(sites, this.getAttribute("data-index"));
    });
  });
}

function removeSite(sites, siteIndex) {
  sites.splice(siteIndex, 1);
  renderSites(sites);
  updateBlockedCount(sites.length);
}

function updateBlockedCount(sitesLength) {
  blockedCountEl.textContent = sitesLength;
}

function addSession(sessions) {
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;

  if (startTime && endTime && startTime !== endTime) {
    const session = `${startTime} - ${endTime}`;
    if (!sessions.includes(session)) {
      sessions.push(session);
      renderSessions(sessions);
      startTimeInput.value = "";
      endTimeInput.value = "";

      const newSessionItem = sessionList.lastElementChild;
      if (newSessionItem) {
        newSessionItem.classList.add("fade-in");
      }
    }
  }
}

function renderSessions(sessions) {
  sessionList.innerHTML = sessions
    .map(
      (session, index) => `
<div class="list-item">
  <div class="list-item-content">
    <span>⏰</span>
    <span>${session}</span>
  </div>
  <button id="remove-btn-session" class="remove-btn" data-index="${index}">✕</button>
</div>
`,
    )
    .join("");

  document.querySelectorAll("#remove-btn-session").forEach((button) => {
    button.addEventListener("click", function () {
      removeSession(sessions, this.getAttribute("data-index"));
    });
  });
}

function removeSession(sessions, sessionIndex) {
  sessions.splice(sessionIndex, 1);
  renderSessions(sessions);
}

function renderSelectedDays(dayObject) {
  for (const [id, value] of Object.entries(dayObject)) {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.checked = !!value;
    }
  }
}

function getSelectedDays() {
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const result = {};

  days.forEach((id) => {
    const checkbox = document.getElementById(id);
    result[id] = checkbox ? checkbox.checked : false;
  });

  return result;
}

function saveSettings(storageResult) {
  const shouldShowConfirmationPopup = isWithInSessionTime(
    storageResult.initialSessions,
  );

  if (shouldShowConfirmationPopup) {
    showConfirm(
      () => {
        updateApplicationSettings(storageResult);
      },
      () => alert("Great choice!"),
    );

    return;
  }

  updateApplicationSettings(storageResult);
}

function updateApplicationSettings(storageResult) {
  saveButton.classList.add("success");
  saveButton.textContent = "✅ Saved!";
  statusDot.style.backgroundColor = "#3b82f6";
  statusText.textContent = "FocusBlock active";

  saveToStorage(storageResult);

  setTimeout(() => {
    saveButton.textContent = "🚀 Save Settings";
    saveButton.classList.remove("success");
  }, 2000);
}

function saveToStorage(storageResult) {
  const sites = storageResult.sites;
  const sessions = storageResult.sessions;
  const daySettings = storageResult.daySettings;

  chrome.storage.sync.set({ sites, sessions, daySettings }, () => {
    chrome.runtime.sendMessage({
      action: "updateSettings",
      sites,
      sessions,
      daySettings,
    });
  });
}

function showConfirm(onYes, onNo) {
  const overlay = document.getElementById("terminalOverlay");
  const textEl = document.getElementById("terminalText");
  const btnYes = document.getElementById("terminalYes");
  const btnNo = document.getElementById("terminalNo");

  const disciplineMessage = getRandomDisciplineMessage();

  let step = 1;

  const stepMessages = {
    1: [
      "> SYSTEM ALERT: Override request detected...",
      "> User attempting to bypass block protocol.",
      `> ${disciplineMessage}`,
      "> Confirm override? (Proceed / Abort)",
    ],
    2: [
      "> WARNING: You are about to break your focus session!",
      "> This may reduce productivity and undo progress.",
      "> Are you absolutely sure you want to continue? (Proceed / Abort)",
    ],
  };

  function typeMessage(msgArray, callback) {
    let i = 0,
      line = 0;
    textEl.textContent = "";
    btnYes.style.display = "none";
    btnNo.style.display = "none";

    function typeLine() {
      if (line < msgArray.length) {
        if (i < msgArray[line].length) {
          textEl.textContent += msgArray[line][i];
          i++;
          setTimeout(typeLine, 30);
        } else {
          textEl.textContent += "\n";
          i = 0;
          line++;
          setTimeout(typeLine, 400);
        }
      } else {
        btnYes.style.display = "block";
        btnNo.style.display = "block";
        if (callback) callback();
      }
    }

    typeLine();
  }

  overlay.classList.add("active");
  typeMessage(stepMessages[step]);

  btnYes.onclick = () => {
    if (step === 1) {
      // Step 1 confirmed → move to step 2
      step = 2;
      typeMessage(stepMessages[step]);
      // Optional: warn user they cannot leave page
      window.addEventListener("beforeunload", preventLeaving);
    } else {
      // Step 2 confirmed → final action
      overlay.classList.remove("active");
      btnYes.style.display = "block";
      btnNo.style.display = "block";
      window.removeEventListener("beforeunload", preventLeaving);
      if (onYes) onYes();
    }
  };

  btnNo.onclick = () => {
    overlay.classList.remove("active");
    btnYes.style.display = "block";
    btnNo.style.display = "block";
    window.removeEventListener("beforeunload", preventLeaving);
    if (onNo) onNo();
  };

  function preventLeaving(e) {
    e.preventDefault();
    e.returnValue =
      "You have an active focus session. Are you sure you want to leave?";
  }
}
