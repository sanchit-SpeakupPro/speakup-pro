// Speakup PRO — business plan page: chart tooltip
(() => {
  const data = window.FORECAST || [], wrap = document.getElementById("chartWrap"), tip = document.getElementById("tip");
  const C = { proRev: ["#8B6DFF", "Pro subscriptions"], teamRev: ["#1FAE74", "Team subscriptions"], other: ["#D27626", "Other revenue"] };
  const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
  if (wrap && tip) {
    const svg = wrap.querySelector("svg");
    const show = (i, evt) => {
      const d = data[i]; if (!d) return;
      tip.innerHTML = "<b>Month " + d.m + "</b>" + Object.entries(C).map(([k, [c, l]]) => "<div><span><i style=\"background:" + c + "\"></i>" + l + "</span><span>" + inr(d[k]) + "</span></div>").join("") + "<div class=\"tot\"><span>Total</span><span>" + inr(d.total) + "</span></div>";
      svg.querySelectorAll("[data-m]").forEach((el) => el.classList.toggle("dim", el.dataset.m !== String(d.m)));
      const r = wrap.getBoundingClientRect(), hit = evt.currentTarget.getBoundingClientRect();
      const tw = tip.offsetWidth || 250, mid = hit.left - r.left + wrap.scrollLeft + hit.width / 2; let x = mid + hit.width / 2; if (x + tw > wrap.scrollLeft + r.width) x = mid - hit.width / 2 - tw;
      tip.style.left = Math.max(0, x) + "px"; tip.style.top = "12px"; tip.classList.add("on");
    };
    const hide = () => { tip.classList.remove("on"); svg.querySelectorAll(".dim").forEach((el) => el.classList.remove("dim")); };
    svg.querySelectorAll(".hit").forEach((h) => { h.addEventListener("pointerenter", (e) => show(+h.dataset.i, e)); h.addEventListener("pointerleave", hide); });
  }
  const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
