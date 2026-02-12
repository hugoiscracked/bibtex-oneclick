const api = typeof browser !== "undefined" ? browser : chrome;

const textarea = document.getElementById("bibtex");
const countEl = document.getElementById("count");
const copyBtn = document.getElementById("copy-all");
const clearSessionBtn = document.getElementById("clear-session");
const settingsBtn = document.getElementById("settings-btn");
const settingsMenu = document.getElementById("settings-menu");
const clearAllTimeBtn = document.getElementById("clear-alltime");
const tabs = document.querySelectorAll(".tab");

let sessionEntries = [];
let allTimeEntries = [];
let activeTab = "session";

function render() {
  const entries = activeTab === "session" ? sessionEntries : allTimeEntries;
  const texts = entries.map((e) => e.text);

  clearSessionBtn.classList.toggle("hidden", activeTab !== "session" || texts.length === 0);

  if (texts.length === 0) {
    countEl.textContent = "No entries yet";
    textarea.value = "";
    textarea.placeholder =
      activeTab === "session"
        ? "Entries collected this session will appear here."
        : "All entries ever collected will appear here.";
    copyBtn.disabled = true;
    return;
  }

  countEl.textContent = `${texts.length} ${texts.length === 1 ? "entry" : "entries"}`;
  textarea.value = texts.join("\n\n");
  textarea.placeholder = "";
  copyBtn.disabled = false;
}

api.runtime.sendMessage({ type: "getBibtexCollection" }, (res) => {
  sessionEntries = res.session;
  allTimeEntries = res.allTime;
  render();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    activeTab = tab.dataset.tab;
    render();
  });
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(textarea.value).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = "Copy All";
    }, 1500);
  });
});

clearSessionBtn.addEventListener("click", () => {
  api.runtime.sendMessage({ type: "clearSession" }, () => {
    sessionEntries = [];
    render();
  });
});

// Settings gear menu
settingsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  settingsMenu.classList.toggle("hidden");
});

document.addEventListener("click", () => {
  settingsMenu.classList.add("hidden");
});

settingsMenu.addEventListener("click", (e) => {
  e.stopPropagation();
});

clearAllTimeBtn.addEventListener("click", () => {
  if (!confirm("Clear all collected BibTeX entries? This cannot be undone.")) return;
  api.runtime.sendMessage({ type: "clearAllTime" }, () => {
    allTimeEntries = [];
    settingsMenu.classList.add("hidden");
    render();
  });
});
