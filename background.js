const api = typeof browser !== "undefined" ? browser : chrome;

let sessionCollection = [];

api.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "storeBibtex") {
    const { cid, text } = msg;

    if (!sessionCollection.some((e) => e.cid === cid)) {
      sessionCollection.push({ cid, text });
    }

    api.storage.local.get({ allTimeCollection: [] }, (data) => {
      const allTime = data.allTimeCollection;
      if (!allTime.some((e) => e.cid === cid)) {
        allTime.push({ cid, text });
        api.storage.local.set({ allTimeCollection: allTime });
      }
    });
    return;
  }

  if (msg.type === "getBibtexCollection") {
    api.storage.local.get({ allTimeCollection: [] }, (data) => {
      sendResponse({
        session: sessionCollection,
        allTime: data.allTimeCollection,
      });
    });
    return true;
  }

  if (msg.type === "getCollectedCids") {
    api.storage.local.get({ allTimeCollection: [] }, (data) => {
      sendResponse(data.allTimeCollection.map((e) => e.cid));
    });
    return true;
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
