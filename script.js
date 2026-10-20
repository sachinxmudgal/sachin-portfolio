const $ = (id) => document.getElementById(id);

/* ---------- Theme toggle ---------- */
const root = document.documentElement;
const themeBtn = $("themeBtn");
const syncTheme = () => themeBtn.setAttribute("aria-label",
  root.dataset.theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
syncTheme();
themeBtn.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  syncTheme();
});

/* ---------- Copy email ---------- */
const copyBtn = $("copyBtn"), copyMsg = $("copyMsg");
let copyTimer;
copyBtn.addEventListener("click", async () => {
  const email = $("mailText").textContent.trim();
  let ok = false;
  try { await navigator.clipboard.writeText(email); ok = true; }
  catch (e) {
    const t = document.createElement("textarea");
    t.value = email; document.body.appendChild(t); t.select();
    try { ok = document.execCommand("copy"); } catch (e2) {}
    t.remove();
  }
  copyMsg.textContent = ok ? "Copied!" : "Press Ctrl+C to copy";
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => (copyMsg.textContent = ""), 2200);
});

/* ---------- Highlight current section in nav ---------- */
const links = [...document.querySelectorAll("nav a")];
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));

/* ---------- Hero terminal ---------- */
const out = $("termOut");
if (out) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const staticText = out.dataset.static;
  const steps = [
    { cmd: "whoami", out: ["sachin, devops engineer"] },
    { cmd: "terraform apply", out: ["Apply complete. Resources: 14 added."] },
    { cmd: "jenkins build main", out: ["Checkout", "Build + test", "SonarQube", "OWASP scan", "Deploy"].map((s) => ({ stage: s })) },
  ];
  const render = (html) => { out.innerHTML = html + '<span class="cur"></span>'; };
  {
    out.setAttribute("aria-label", staticText);
    let html = "";
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      for (const step of steps) {
        const prefix = html + '<span class="p">$</span> ';
        for (let i = 1; i <= step.cmd.length; i++) { render(prefix + esc(step.cmd.slice(0, i))); await wait(45); }
        html = prefix + esc(step.cmd) + "\n"; render(html); await wait(350);
        for (const line of step.out) {
          if (line.stage) {
            html += '  <span class="out">' + esc(line.stage.padEnd(14)) + '</span><span class="ok">passed</span>\n';
            render(html); await wait(420);
          } else {
            html += '<span class="out">' + esc(line) + "</span>\n"; render(html); await wait(300);
          }
        }
        html += "\n";
      }
      render(html + '<span class="p">$</span> ');
    })();
  }
}

/* ---------- Scroll progress ---------- */
const bar = $("progress");
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = "scaleX(" + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ")";
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Reveal on scroll ---------- */
{
  const items = document.querySelectorAll("main h2, .sub, .skills > div, .item, .win, .score, .mailrow, .subhead, .about-copy, .photo, .about + .term");
  const rv = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("in");
      rv.unobserve(el);
      // drop the reveal classes afterwards so hover effects work
      setTimeout(() => { el.classList.remove("rv", "in"); el.style.transitionDelay = ""; }, 1200);
    });
  }, { threshold: 0.12 });
  items.forEach((el, i) => {
    el.classList.add("rv");
    el.style.transitionDelay = (i % 3) * 80 + "ms";
    rv.observe(el);
  });
}
