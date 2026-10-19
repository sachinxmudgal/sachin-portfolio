// One orchestrated moment: the hero terminal runs a short pipeline.
const out = document.getElementById("termOut");
if (out) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const staticText = out.dataset.static;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const steps = [
    { cmd: "whoami", out: ["sachin, devops engineer"] },
    { cmd: "terraform apply", out: ["Apply complete. Resources: 14 added."] },
    { cmd: "jenkins build main", out: ["Checkout", "Build + test", "SonarQube", "OWASP scan", "Deploy"].map((s) => ({ stage: s })) },
  ];

  const render = (html) => { out.innerHTML = html + '<span class="cur"></span>'; };

  if (reduce) {
    out.textContent = staticText;
  } else {
    out.setAttribute("aria-label", staticText);
    let html = "";
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      for (const step of steps) {
        const prefix = html + '<span class="p">$</span> ';
        for (let i = 1; i <= step.cmd.length; i++) {
          render(prefix + esc(step.cmd.slice(0, i)));
          await wait(45);
        }
        html = prefix + esc(step.cmd) + "\n";
        render(html);
        await wait(350);
        for (const line of step.out) {
          if (line.stage) {
            html += '  <span class="out">' + esc(line.stage.padEnd(14)) + '</span><span class="ok">passed</span>\n';
            render(html);
            await wait(420);
          } else {
            html += '<span class="out">' + esc(line) + "</span>\n";
            render(html);
            await wait(300);
          }
        }
        html += "\n";
      }
      render(html + '<span class="p">$</span> ');
    })();
  }
}
