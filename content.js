const api = typeof browser !== "undefined" ? browser : chrome;
const processed = new WeakSet();

function createButton(cid) {
  const btn = document.createElement("a");
  btn.className = "bibtex-oneclick-btn";
  btn.textContent = "BibTeX";
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
  btn.classList.remove("success", "error");
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
    api.runtime.sendMessage({ type: "storeBibtex", text: result.text });

    btn.classList.remove("loading");
    btn.classList.add("success");
    btn.textContent = "\u2713 Copied!";
    setTimeout(() => {
      btn.classList.remove("success");
      btn.textContent = "BibTeX";
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

injectButtons(document);

const container = document.getElementById("gs_res_ccl_mid");
if (container) {
  new MutationObserver(() => injectButtons(container)).observe(container, {
    childList: true,
    subtree: true,
  });
}
