import { motivationalQuotes } from "./quotes.js";
const isWithInSessionTime = window.isWithInSessionTime

const blockedAppsTextarea = document.getElementById("blockedApps");
const sessionStartInput = document.getElementById("sessionStart");
const sessionEndInput = document.getElementById("sessionEnd");
const addSessionButton = document.getElementById("addSession");
const sessionListDiv = document.getElementById("sessionList");
const saveButton = document.getElementById("saveButton");

const defaultDaysSettings = [
  { day: "Monday", enabled: false },
  { day: "Tuesday", enabled: false },
  { day: "Wednesday", enabled: false },
  { day: "Thursday", enabled: false },
  { day: "Friday", enabled: false },
  { day: "Saturday", enabled: false },
  { day: "Sunday", enabled: false },
];

document.addEventListener("DOMContentLoaded", () => init());

function init() {
  const result = {};

  chrome.storage.sync.get(["blockedApps", "sessions", "daySettings"], (res) => {
    const initSessions = structuredClone(res.sessions) || [];

    result.blockedApps = (res.blockedApps || []).join("\n");
    result.sessions = res.sessions || [];
    result.daySettings = res.daySettings || [];

    updatePopUpForm(result.blockedApps, result.sessions, result.daySettings);

    addSessionButton.addEventListener("click", () => {
      addSession(result.sessions)
    });

    saveButton.addEventListener("click", () => {
      if (!hasPermission(defaultDaysSettings, initSessions)) {
        return
      }

      updateAppData({
        blockedApps: blockedAppsTextarea.value,
        sessions: result.sessions,
        daySettings: getDaySettings(defaultDaysSettings),
      })
    });
  });
}

function updateAppData(data) {
  const blockedApps = data.blockedApps
    .split("\n")
    .map((app) => app.trim())
    .filter(Boolean);
  const daySettings = data.daySettings;
  const sessions = data.sessions;

  chrome.storage.sync.set({ blockedApps, sessions, daySettings }, () => {
    chrome.runtime.sendMessage({
      action: "updateSettings",
      blockedApps,
      sessions,
      daySettings,
    });

    alert("Settings saved!");
  });
}

function hasPermission(currentDaysSettings, initialSessions) {
  const now = new Date()

  const currentDaySettings = currentDaysSettings[now.getDay() - 1]

  if (!currentDaySettings.enabled) {
    return true
  }

  if (isWithInSessionTime(initialSessions)) {
    alert(`You're not allowed to change settings while in an active session.

Quote: ${motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}`);

    return false
  }


  return true
}


function updatePopUpForm(blockedApps, sessions, daySettings) {
  blockedAppsTextarea.value = blockedApps;

  renderSessions(sessions);
  updateDaySettings(defaultDaysSettings, daySettings);
}

function renderSessions(sessions) {
  sessionListDiv.innerHTML = "";

  sessions.forEach((session, index) => {
    const sessionElement = document.createElement("div");

    sessionElement.className =
      "d-flex justify-content-between align-items-center mb-2";
    sessionElement.innerHTML = `
                  <span class="me-2">${session.start} - ${session.end}</span>
                  <button class="btn btn-danger btn-sm remove-session" data-index="${index}">Remove</button>
              `;
    sessionListDiv.appendChild(sessionElement);
  });

  document.querySelectorAll(".remove-session").forEach((button) => {
    button.addEventListener("click", () => removeSession(sessions, parseInt(this.getAttribute("data-index"))));
  });
}

function addSession(sessions) {
  const start = sessionStartInput.value;
  const end = sessionEndInput.value;

  if (start && end) {
    sessions.push({ start, end });
    renderSessions(sessions);
    sessionStartInput.value = "";
    sessionEndInput.value = "";
  }
}

function removeSession(sessions, index) {
  sessions.splice(index, 1);
  renderSessions(sessions);
}
function getDaySettings(currentDaysSettings) {
  const result = [];

  for (const setting of currentDaysSettings) {
    setting.enabled = result.push({
      day: setting.day,
      enabled: document.getElementById(`day${setting.day}`).checked,
    });
  }

  return result;
}

function updateDaySettings(defaultDaySettings, updatedDaySettings) {
  if (updatedDaySettings.length === 0) {
    return;
  }

  for (const defaultDay of defaultDaySettings) {
    for (const updatedDay of updatedDaySettings) {
      if (defaultDay.day === updatedDay.day) {
        document.getElementById("day" + defaultDay.day).checked =
          updatedDay.enabled;
        defaultDay.enabled = updatedDay.enabled;

        break;
      }
    }
  }
}
