const SITES_STORAGE_KEY = "sites";
const SESSIONS_STORAGE_KEY = "sessions";
const DAY_SETTINGS_STORAGE_KEY = "daySettings";

let sites = [];
let sessions = [];
let daySettings = [];

function loadSettings() {
  chrome.storage.sync.get(
    [SITES_STORAGE_KEY, SESSIONS_STORAGE_KEY, DAY_SETTINGS_STORAGE_KEY],
    (res) => {
      sites = res[SITES_STORAGE_KEY] || [];
      sessions = res[SESSIONS_STORAGE_KEY] || [];
      daySettings = res[DAY_SETTINGS_STORAGE_KEY] || [];
    },
  );
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateSettings") {
    sites = request.blockedApps;
    sessions = request.sessions;
    daySettings = request.daySettings;
  }
});

loadSettings();
