const api = typeof browser !== "undefined" ? browser : chrome;
const processed = new WeakSet();

function createButton(cid) {
  const btn = document.createElement("a");
  btn.className = "bibtex-oneclick-btn";
  btn.textContent = "BibTeX";
  btn.dataset.cid = cid;
  btn.href = "#";
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (btn.classList.contains("loading")) return;
    handleClick(btn, cid);
  });
  return btn;
}

async function handleClick(btn, cid) {
  btn.classList.remove("success", "error", "collected");
  btn.classList.add("loading");
  btn.textContent = "...";

  try {
    const citeUrl = `https://${location.hostname}/scholar?q=info:${cid}:scholar.google.com/&output=cite`;
    const citeRes = await fetch(citeUrl);
    if (!citeRes.ok) throw new Error(`Cite fetch failed: ${citeRes.status}`);
    const citeHtml = await citeRes.text();

    const doc = new DOMParser().parseFromString(citeHtml, "text/html");
    const bibtexLink = Array.from(doc.querySelectorAll("a")).find(
      (a) => a.textContent.trim() === "BibTeX"
    );
    if (!bibtexLink) throw new Error("BibTeX link not found");

    const bibtexUrl = bibtexLink.href;
    const result = await api.runtime.sendMessage({
      type: "fetchBibtex",
      url: bibtexUrl,
    });
    if (result.error) throw new Error(result.error);

    await navigator.clipboard.writeText(result.text);
    api.runtime.sendMessage({ type: "storeBibtex", cid, text: result.text });

    btn.classList.remove("loading");
    btn.classList.add("success");
    btn.textContent = "\u2713 Copied!";
    setTimeout(() => {
      btn.classList.remove("success");
      btn.classList.add("collected");
      btn.textContent = "\u2713 BibTeX";
    }, 2000);
  } catch (err) {
    console.error("BibTeX One-Click:", err);
    btn.classList.remove("loading");
    btn.classList.add("error");
    btn.textContent = "\u2717 Error";
    setTimeout(() => {
      btn.classList.remove("error");
      btn.textContent = "BibTeX";
    }, 3000);
  }
}

function injectButtons(root) {
  const results = root.querySelectorAll("div.gs_r.gs_or.gs_scl[data-cid]");
  for (const el of results) {
    if (processed.has(el)) continue;
    processed.add(el);

    const cid = el.dataset.cid;
    const footer = el.querySelector(".gs_fl");
    if (!footer) continue;

    const btn = createButton(cid);
    footer.appendChild(btn);
  }
}

function markCollectedButtons(cids) {
  const cidSet = new Set(cids);
  const buttons = document.querySelectorAll(".bibtex-oneclick-btn[data-cid]");
  for (const btn of buttons) {
    if (cidSet.has(btn.dataset.cid)) {
      btn.classList.add("collected");
      btn.textContent = "\u2713 BibTeX";
    }
  }
}

injectButtons(document);

api.runtime.sendMessage({ type: "getCollectedCids" }, (cids) => {
  if (cids && cids.length) markCollectedButtons(cids);
});

const container = document.getElementById("gs_res_ccl_mid");
if (container) {
  new MutationObserver(() => {
    injectButtons(container);
    api.runtime.sendMessage({ type: "getCollectedCids" }, (cids) => {
      if (cids && cids.length) markCollectedButtons(cids);
    });
  }).observe(container, {
    childList: true,
    subtree: true,
  });
}
