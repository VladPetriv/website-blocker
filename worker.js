import { isWithInSessionTime } from "./common.js";

const SITES_STORAGE_KEY = "sites";
const SESSIONS_STORAGE_KEY = "sessions";
const DAY_SETTINGS_STORAGE_KEY = "daySettings";
const dayMap = new Map([
  ["sun", 0],
  ["mon", 1],
  ["tue", 2],
  ["wed", 3],
  ["thu", 4],
  ["fri", 5],
  ["sat", 6],
]);

let sites = [];
let sessions = [];
let daySettings = {};

loadSettings();

function loadSettings() {
  chrome.storage.sync.get(
    [SITES_STORAGE_KEY, SESSIONS_STORAGE_KEY, DAY_SETTINGS_STORAGE_KEY],
    (res) => {
      sites = res[SITES_STORAGE_KEY] || [];
      sessions = res[SESSIONS_STORAGE_KEY] || [];
      daySettings = res[DAY_SETTINGS_STORAGE_KEY] || {};
    },
  );
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateSettings") {
    sites = request.sites;
    sessions = request.sessions;
    daySettings = request.daySettings;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const shouldProcessRequest = changeInfo.status === "complete" && tab.url;
  if (!shouldProcessRequest) return;

  if (sessions.length === 0) {
    console.debug("no session found, no need to block apps");
    return;
  }

  const currentDay = new Date().getDay();

  let hasEnabledAnyDay;
  for (const [day, state] of Object.entries(daySettings)) {
    hasEnabledAnyDay = dayMap.get(day) === currentDay && state;
    if (hasEnabledAnyDay) {
      break;
    }
  }
  if (!hasEnabledAnyDay) {
    console.debug("no enabled day found");
    return;
  }

  const url = new URL(tab.url);
  const currentHost = normalizeHost(url.hostname);

  let isFromBlockedSite;
  for (const blockedSite of sites) {
    const target = normalizeHost(blockedSite);
    if (currentHost === target) {
      console.debug(
        `url:${url.hostname}, blocked site: ${blockedSite}, equals: ${currentHost === target}`,
      );
      isFromBlockedSite = true;
      break;
    }
  }

  if (!isFromBlockedSite) {
    console.debug("application is not from blocked list");
    return;
  }

  return isWithInSessionTime(sessions)
    ? chrome.tabs.update(tabId, { url: "https://google.com" })
    : null;
});

function normalizeHost(host) {
  return host.startsWith("www.") ? host.slice(4) : host;
}
