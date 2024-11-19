let blockedApps = [];
let sessions = [];
let daySettings = [];

function loadSettings() {
  chrome.storage.sync.get(
    ["blockedApps", "sessions", "daySettings"],
    function (result) {
      blockedApps = result.blockedApps || [];
      sessions = result.sessions || [];
      daySettings = result.daySettings || [];

      console.log(daySettings);
    },
  );
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (sessions.length === 0) {
      console.debug("no session found, no need to block apps");
      return { cancel: false };
    }

    const currentDay = new Date().getDay();

    const hasEnabledAnyDay = daySettings.some((settings) => {
      return settings.enabled && (dayMap.get(settings.day) === currentDay);
    });
    if (!hasEnabledAnyDay) {
      return { cancel: false };
    }


    const isFromBlockedApps = blockedApps.some(
      (app) => details.url.includes(app) || details.initiator.includes(app),
    );
    if (!isFromBlockedApps) {
      console.debug("application is not from blocked list");
      return { cancel: false };
    }

    return isWithInSessionTime(sessions) ? { cancel: true } : { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["blocking"],
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "updateSettings") {
    blockedApps = request.blockedApps;
    sessions = request.sessions;
    daySettings = request.daySettings;

    console.log(request);
  }
});

loadSettings();
