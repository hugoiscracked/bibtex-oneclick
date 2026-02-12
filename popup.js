const api = typeof browser !== "undefined" ? browser : chrome;

const textarea = document.getElementById("bibtex");
const countEl = document.getElementById("count");
const copyBtn = document.getElementById("copy-all");

api.runtime.sendMessage({ type: "getBibtexCollection" }, (res) => {
  const entries = res.collection;
  if (entries.length === 0) {
    countEl.textContent = "No entries yet";
    textarea.placeholder = "Click BibTeX buttons on Google Scholar to collect entries here.";
    copyBtn.disabled = true;
    return;
  }
  countEl.textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
  textarea.value = entries.join("\n\n");
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(textarea.value).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = "Copy All";
    }, 1500);
  });
});
