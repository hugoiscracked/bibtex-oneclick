const api = typeof browser !== "undefined" ? browser : chrome;

let collection = [];

api.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "storeBibtex") {
    if (!collection.includes(msg.text)) {
      collection.push(msg.text);
    }
    return;
  }

  if (msg.type === "getBibtexCollection") {
    sendResponse({ collection });
    return;
  }

  if (msg.type !== "fetchBibtex") return;

  try {
    const url = new URL(msg.url);
    if (url.hostname !== "scholar.googleusercontent.com") {
      sendResponse({ error: "Invalid hostname" });
      return true;
    }
  } catch {
    sendResponse({ error: "Invalid URL" });
    return true;
  }

  fetch(msg.url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then((text) => sendResponse({ text }))
    .catch((err) => sendResponse({ error: err.message }));

  return true;
});
