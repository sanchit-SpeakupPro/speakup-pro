// Speakup PRO — website interactions
(() => {
  // ------------------------------------------------------------ instagram
  // Your Instagram username (without @). Every follow link and handle on the page uses this.
  const INSTAGRAM = "speakup.pro.app";
  for (const a of document.querySelectorAll("[data-ig-link]")) a.href = `https://www.instagram.com/${INSTAGRAM}/`;
  for (const el of document.querySelectorAll("[data-ig-handle]")) el.textContent = INSTAGRAM;

  // ------------------------------------------------------------ downloads
  // Point these at wherever the installers are hosted (e.g. GitHub Releases).
  const RELEASE = "https://github.com/sanchit-SpeakupPro/speakup-pro/releases/latest/download/";
  const DOWNLOADS = {
    "mac-arm": { file: "Speakup-PRO-1.1.0-mac-arm64.dmg", label: "Download for Mac", size: "153 MB" },
    "mac-intel": { file: "Speakup-PRO-1.1.0-mac-x64.dmg", label: "Download for Mac (Intel)", size: "158 MB" },
    windows: { file: "Speakup-PRO-Setup-1.1.0-windows.exe", label: "Download for Windows", size: "139 MB" },
  };
  const APPLE = "var(--apple)", WIN = "var(--windows)";

  for (const a of document.querySelectorAll("[data-platform]")) a.href = RELEASE + DOWNLOADS[a.dataset.platform].file;

  async function detect() {
    const ua = navigator.userAgent;
    if (/Windows/i.test(ua)) return "windows";
    if (/Mac/i.test(ua) && !/iPhone|iPad/i.test(ua)) {
      // Apple Silicon detection: Client Hints where available, else WebGL renderer, else assume Apple Silicon (most Macs sold since 2021).
      try {
        if (navigator.userAgentData?.getHighEntropyValues) {
          const { architecture } = await navigator.userAgentData.getHighEntropyValues(["architecture"]);
          if (architecture) return architecture === "arm" ? "mac-arm" : "mac-intel";
        }
      } catch {}
      try {
        const gl = document.createElement("canvas").getContext("webgl");
        const r = gl && gl.getParameter(gl.getExtension("WEBGL_debug_renderer_info")?.UNMASKED_RENDERER_WEBGL);
        if (r && /Intel|AMD|Radeon/i.test(r) && !/Apple/i.test(r)) return "mac-intel";
      } catch {}
      return "mac-arm";
    }
    return null; // phones, Linux…
  }
  detect().then((os) => {
    const primary = document.querySelector("[data-download-primary]");
    if (!os) { primary.querySelector("[data-os-label]").textContent = "Download for Mac & Windows"; return; }
    const d = DOWNLOADS[os];
    primary.href = RELEASE + d.file;
    primary.querySelector("[data-os-label]").textContent = d.label;
    const ico = primary.querySelector("[data-os-icon]");
    ico.style.setProperty("--ico", os === "windows" ? WIN : APPLE);
    ico.textContent = " ";
    document.querySelector("[data-os-size]").textContent = d.size;
    document.querySelector(`[data-platform="${os}"]`)?.classList.add("recommended");
  });

  // ------------------------------------------------------------ hero demo
  const SCRIPT = [
    { t: 1, who: "Priya", c: "c1", text: "Okay, let's get started. Daniel, how's the mobile release going?" },
    { t: 6, who: "Daniel", c: "c2", text: "We're on track. The beta goes out to testers on Monday, and we fixed the login crash." },
    { t: 12, who: "Karen", c: "c3", text: "Nice. The new onboarding screens are finished on the design side." },
    { t: 17, who: "Rishi", c: "c4", text: "I can set up the analytics dashboard so we can track beta signups." },
    { t: 23, who: "Priya", c: "c1", text: "Perfect. Rishi, please have that ready by Wednesday." },
    { t: 27, who: "Daniel", c: "c2", text: "One risk is the App Store review — it could take a few extra days." },
    { t: 32, who: "Karen", c: "c3", text: "Then let's submit by Thursday to give ourselves a buffer." },
  ];
  const NOTES = [
    ["h", "Summary"],
    ["p", "Beta ships to testers Monday after the login fix. Onboarding is done; App Store review timing is the main risk."],
    ["h", "Action items"],
    ["li", '<b class="c4">Rishi</b> — analytics dashboard, <em>by Wed</em>'],
    ["li", '<b class="c3">Karen</b> — submit to App Store, <em>by Thu</em>'],
    ["li", '<b class="c2">Daniel</b> — send beta to testers, <em>Mon</em>'],
  ];
  const tr = document.getElementById("demoTranscript"), notes = document.getElementById("demoNotes");
  const timer = document.getElementById("demoTimer"), waveEl = document.getElementById("demoWave");
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const bars = Array.from({ length: 22 }, () => { const i = document.createElement("i"); waveEl.appendChild(i); return i; });
  let talking = false;
  setInterval(() => bars.forEach((b, i) => { b.style.height = (talking ? 4 + Math.abs(Math.sin(Date.now() / 140 + i * 0.7)) * 16 * Math.random() : 3 + Math.random() * 2) + "px"; }), 110);

  async function typeInto(el, text, speed = 22) {
    el.classList.add("cursor-blink");
    for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await sleep(speed); }
    el.classList.remove("cursor-blink");
  }

  async function runDemo() {
    for (;;) {
      tr.querySelectorAll(".line").forEach((l) => l.remove());
      notes.innerHTML = '<p class="wait">Notes appear when you stop recording…</p>';
      let sec = 0; timer.textContent = "00:00";
      const clock = setInterval(() => { sec++; timer.textContent = fmt(sec); }, 1000);
      for (const s of SCRIPT) {
        const line = document.createElement("div");
        line.className = "line interim";
        line.innerHTML = `<span class="t">${fmt(s.t)}</span><div><span class="who ${s.c}">${s.who}</span><p></p></div>`;
        tr.appendChild(line);
        while (tr.scrollHeight > tr.clientHeight && tr.querySelectorAll(".line").length > 1) tr.querySelector(".line").remove();
        talking = true;
        await typeInto(line.querySelector("p"), s.text, reduce ? 0 : 24);
        talking = false;
        line.classList.remove("interim");
        await sleep(reduce ? 50 : 520);
      }
      clearInterval(clock);
      notes.innerHTML = "";
      let ul = null;
      for (const [kind, html] of NOTES) {
        if (kind === "h") { notes.insertAdjacentHTML("beforeend", `<h5>${html}</h5>`); ul = null; }
        else if (kind === "p") { const p = document.createElement("p"); notes.appendChild(p); await typeInto(p, html, reduce ? 0 : 12); }
        else { if (!ul) { ul = document.createElement("ul"); notes.appendChild(ul); } ul.insertAdjacentHTML("beforeend", `<li><span class="box"></span><span>${html}</span></li>`); }
        await sleep(reduce ? 50 : 380);
      }
      await sleep(5200);
    }
  }
  runDemo();

  // ------------------------------------------------------------ polish toggle
  const tabs = [...document.querySelectorAll(".polish-toggle button")], thumb = document.querySelector(".toggle-thumb");
  const panes = [...document.querySelectorAll(".pv")];
  let auto = true;
  function show(i) {
    tabs.forEach((t, k) => t.setAttribute("aria-selected", String(k === i)));
    panes.forEach((p, k) => p.classList.toggle("active", k === i));
    thumb.style.transform = `translateX(${i * 100}%)`;
  }
  tabs.forEach((t, i) => t.addEventListener("click", () => { auto = false; show(i); }));
  let cur = 0;
  setInterval(() => { if (auto && isVisible(document.querySelector(".polish-card"))) show((cur = (cur + 1) % 3)); }, 3800);
  function isVisible(el) { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }

  // ------------------------------------------------------------ typewriter tile
  const tw = document.querySelector(".typewriter");
  (async function loopType() {
    for (;;) { await typeInto(tw, tw.dataset.text, 55); await sleep(2200); tw.textContent = ""; await sleep(500); }
  })();

  // ------------------------------------------------------------ reveal + chat on scroll
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in", "play"); io.unobserve(e.target); }
  }, { threshold: 0.15 });
  document.querySelectorAll(".section-head, .tile, .polish-card, .privacy-grid, .price-card, .steps li, .faq-list, .ig-card, .dl-card").forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  document.querySelectorAll(".chat").forEach((el) => io.observe(el));

  // spotlight glow following the cursor on tiles
  document.querySelectorAll(".tile").forEach((t) => t.addEventListener("pointermove", (e) => {
    const r = t.getBoundingClientRect();
    t.style.setProperty("--mx", `${e.clientX - r.left}px`); t.style.setProperty("--my", `${e.clientY - r.top}px`);
  }));

  document.getElementById("year").textContent = new Date().getFullYear();
})();
