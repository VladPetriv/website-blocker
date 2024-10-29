let blockedApps = [];
let sessions = [];
let currentSession = null;
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

const dayMap = new Map([
  ["Monday", 1],
  ["Tuesday", 2],
  ["Wednesday", 3],
  ["Thursday", 4],
  ["Friday", 5],
  ["Saturday", 6],
  ["Sunday", 7],
]);

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

    for (const session of sessions) {
      const { hours: startSessionHour, minutes: startSessionMinute } =
        parseTimeString(session.start);
      const { hours: endSessionHour, minutes: endSessionMinute } =
        parseTimeString(session.end);

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      console.debug(`current hour: ${currentHour}`);
      console.debug(
        `start session hour: ${startSessionHour}, start session minute: ${startSessionMinute}`,
      );
      console.debug(
        `end session hour: ${endSessionHour}, end session minute: ${endSessionMinute}`,
      );

      if (currentHour < startSessionHour || currentHour > endSessionHour) {
        console.debug(
          "no need to start this session, since current hour is less of start hour or more of end hour",
        );

        continue;
      }

      if (startSessionHour === endSessionHour) {
        console.debug("start session hour and end session hour are the same");

        const isWithinSessionHours =
          currentHour >= startSessionHour && currentHour <= endSessionHour;
        const isWithinSessionMinutes =
          currentMinute >= startSessionMinute &&
          currentMinute <= endSessionMinute;
        return isWithinSessionHours && isWithinSessionMinutes
          ? { cancel: true }
          : { cancel: false };
      }

      if (endSessionHour > startSessionHour) {
        console.debug("ent session hour is more than start session hour");

        const isWithinSessionHours =
          currentHour >= startSessionHour && currentHour <= endSessionHour;
        if (!isWithinSessionHours) {
          return { cancel: true };
        }

        if (isWithinSessionHours && currentHour === endSessionHour) {
          if (endSessionMinute === 0) {
            return { cancel: false };
          }

          if (currentMinute < endSessionMinute) {
            return { cancel: true };
          }

          if (currentMinute > endSessionMinute) {
            return { cancel: false };
          }
        }

        if (isWithinSessionHours && currentHour === startSessionHour) {
          if (startSessionHour === 0) {
            return { cancel: true };
          }

          if (currentMinute < startSessionMinute) {
            return { cancel: false };
          }

          if (currentMinute > startSessionMinute) {
            return { cancel: true };
          }
        }

        return { cancel: true };
      }

      continue;
    }

    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["blocking"],
);

function parseTimeString(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "updateSettings") {
    blockedApps = request.blockedApps;
    sessions = request.sessions;
    daySettings = request.daySettings;

    console.log(request);
  }
});

loadSettings();
