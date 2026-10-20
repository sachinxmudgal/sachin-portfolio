// Each entry: [command, what it does, optional "careful" flag]
const DATA = [
  { name: "Linux", color: "--sage", rows: [
    ["ls -lah", "List files with sizes, permissions and hidden files"],
    ["grep -rn \"error\" /var/log", "Search text recursively and show line numbers"],
    ["find . -name \"*.log\" -mtime +7", "Find log files older than 7 days"],
    ["tail -f /var/log/syslog", "Follow a log file live"],
    ["chmod 640 file && chown user:group file", "Change file permissions and owner"],
    ["ps aux | grep nginx", "Check whether a process is running"],
    ["df -h", "Disk space per filesystem"],
    ["du -sh * | sort -h", "Find which folders use the most space"],
    ["free -h", "Memory usage"],
    ["ss -tulpn", "Listening ports and the processes behind them"],
    ["systemctl status nginx", "Check a service (also: start, stop, restart, enable)"],
    ["journalctl -u nginx -f", "Follow logs of a systemd service"],
    ["curl -I https://example.com", "Fetch only the HTTP response headers"],
    ["ssh -i key.pem user@host", "Connect to a server with a key file"],
    ["scp file.txt user@host:/tmp/", "Copy a file to a remote server"],
    ["tar -czf backup.tar.gz dir/", "Create a compressed archive (extract with tar -xzf)"],
  ]},
  { name: "Git", color: "--poppy", rows: [
    ["git status -sb", "Short status with branch info"],
    ["git add -p", "Stage changes piece by piece"],
    ["git commit -m \"message\"", "Commit staged changes"],
    ["git log --oneline --graph --decorate", "Compact history with branches"],
    ["git switch -c feature/name", "Create and switch to a new branch"],
    ["git fetch --all --prune", "Update remote info and drop deleted branches"],
    ["git stash && git stash pop", "Park changes temporarily, then bring them back"],
    ["git restore --staged file", "Unstage a file but keep the changes"],
    ["git reset --soft HEAD~1", "Undo the last commit, keep changes staged"],
    ["git reset --hard HEAD~1", "Undo the last commit and DISCARD changes", true],
    ["git rebase -i HEAD~3", "Edit, squash or reorder the last 3 commits"],
    ["git cherry-pick <sha>", "Apply one commit from another branch"],
    ["git remote -v", "Show configured remotes"],
  ]},
  { name: "Docker", color: "--plum", rows: [
    ["docker ps -a", "List all containers, running or stopped"],
    ["docker build -t app:1.0 .", "Build an image from the Dockerfile here"],
    ["docker run -d -p 8080:80 --name web nginx", "Run a container in the background with a port mapped"],
    ["docker exec -it web sh", "Open a shell inside a running container"],
    ["docker logs -f web", "Follow container logs"],
    ["docker stop web && docker rm web", "Stop and remove a container"],
    ["docker images", "List local images"],
    ["docker volume ls", "List volumes"],
    ["docker network ls", "List networks"],
    ["docker compose up -d --build", "Build and start all services in the background"],
    ["docker compose logs -f", "Follow logs of all services"],
    ["docker compose down -v", "Stop services and delete their volumes", true],
    ["docker system prune -a", "Remove ALL unused images, containers and networks", true],
  ]},
  { name: "Kubernetes", color: "--teal", rows: [
    ["kubectl get pods -A", "List pods in every namespace"],
    ["kubectl describe pod <pod>", "Events and details, great for debugging"],
    ["kubectl logs -f <pod>", "Follow a pod's logs"],
    ["kubectl exec -it <pod> -- sh", "Open a shell inside a pod"],
    ["kubectl apply -f deployment.yaml", "Create or update resources from a file"],
    ["kubectl scale deployment web --replicas=3", "Change the number of replicas"],
    ["kubectl rollout status deployment/web", "Watch a rollout finish"],
    ["kubectl rollout undo deployment/web", "Roll back to the previous version"],
    ["kubectl port-forward svc/web 8080:80", "Reach a service from your machine"],
    ["kubectl config get-contexts", "List clusters you can talk to"],
    ["kubectl delete -f deployment.yaml", "Delete the resources defined in a file", true],
    ["minikube start", "Start a local cluster"],
  ]},
  { name: "Terraform", color: "--mustard", rows: [
    ["terraform init", "Download providers and set up the backend"],
    ["terraform fmt -recursive", "Format all .tf files"],
    ["terraform validate", "Check the configuration is valid"],
    ["terraform plan -out=tfplan", "Preview changes and save the plan"],
    ["terraform apply tfplan", "Apply exactly the saved plan"],
    ["terraform output", "Show output values"],
    ["terraform state list", "List resources tracked in state"],
    ["terraform state show <address>", "Inspect one resource in state"],
    ["terraform import <address> <id>", "Bring an existing resource under Terraform"],
    ["terraform workspace list", "List workspaces"],
    ["terraform init -upgrade", "Upgrade provider versions within constraints"],
    ["terraform destroy", "Delete everything Terraform manages here", true],
  ]},
  { name: "Ansible", color: "--sage", rows: [
    ["ansible all -m ping -i inventory.ini", "Check Ansible can reach every host"],
    ["ansible-playbook site.yml -i inventory.ini", "Run a playbook"],
    ["ansible-playbook site.yml --check --diff", "Dry run that shows what would change"],
    ["ansible-playbook site.yml -l web", "Limit the run to one host or group"],
    ["ansible-playbook site.yml --tags install", "Run only tasks with a tag"],
    ["ansible-inventory -i inventory.ini --list", "Show the parsed inventory"],
    ["ansible-galaxy role init postgresql", "Create the skeleton of a new role"],
    ["ansible-vault encrypt secrets.yml", "Encrypt a file with a password"],
    ["ansible-doc ansible.builtin.copy", "Read module docs in the terminal"],
  ]},
  { name: "AWS CLI", color: "--poppy", rows: [
    ["aws configure", "Set access keys and default region"],
    ["aws sts get-caller-identity", "Which account and identity am I using?"],
    ["aws s3 ls", "List buckets (add s3://bucket to list objects)"],
    ["aws s3 sync ./dist s3://my-bucket", "Upload changed files to a bucket"],
    ["aws s3 sync ./dist s3://my-bucket --delete", "Sync and also remove files missing locally", true],
    ["aws ec2 describe-instances --query \"Reservations[].Instances[].[InstanceId,State.Name]\" --output table", "Instance IDs and states as a table"],
    ["aws ec2 start-instances --instance-ids <id>", "Start an instance (also stop-instances)"],
    ["aws logs tail /aws/lambda/<name> --follow", "Follow CloudWatch logs live"],
    ["aws iam list-users", "List IAM users"],
  ]},
];

const sheet = document.getElementById("sheet");
const chips = document.getElementById("chips");
const q = document.getElementById("q");
const count = document.getElementById("count");
const empty = document.getElementById("empty");
let active = "All";

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
};

// Build groups
DATA.forEach((g) => {
  const win = el("section", "win");
  win.style.setProperty("--c", `var(${g.color})`);
  win.dataset.group = g.name;
  const bar = el("div", "term-bar");
  ["r", "y", "g"].forEach((c) => bar.appendChild(el("i", c)));
  bar.appendChild(el("span", "", g.name.toLowerCase().replace(/ /g, "-") + ".sh"));
  win.appendChild(bar);
  const body = el("div", "cmds");
  g.rows.forEach(([cmd, desc, careful]) => {
    const row = el("div", "cmd");
    row.dataset.text = (cmd + " " + desc).toLowerCase();
    const top = el("div", "cmd-top");
    const code = el("code", "", cmd);
    const btn = el("button", "copy", "Copy");
    btn.type = "button";
    btn.setAttribute("aria-label", "Copy command: " + cmd);
    btn.addEventListener("click", async () => {
      let ok = false;
      try { await navigator.clipboard.writeText(cmd); ok = true; }
      catch (e) {
        const t = document.createElement("textarea");
        t.value = cmd; document.body.appendChild(t); t.select();
        try { ok = document.execCommand("copy"); } catch (e2) {}
        t.remove();
      }
      btn.textContent = ok ? "Copied" : "Press Ctrl+C";
      btn.classList.toggle("done", ok);
      setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("done"); }, 1600);
    });
    top.append(code, btn);
    const d = el("p", "desc", desc);
    if (careful) d.appendChild(el("b", "warn", "careful"));
    row.append(top, d);
    body.appendChild(row);
  });
  win.appendChild(body);
  sheet.appendChild(win);
});

// Filter chips
["All", ...DATA.map((g) => g.name)].forEach((name) => {
  const b = el("button", "chip", name);
  b.type = "button";
  b.setAttribute("aria-pressed", name === "All");
  b.addEventListener("click", () => {
    active = name;
    chips.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
    apply();
  });
  chips.appendChild(b);
});

function apply() {
  const term = q.value.trim().toLowerCase();
  let shown = 0;
  sheet.querySelectorAll(".win").forEach((win) => {
    const inGroup = active === "All" || win.dataset.group === active;
    let any = 0;
    win.querySelectorAll(".cmd").forEach((row) => {
      const hit = inGroup && (!term || row.dataset.text.includes(term));
      row.hidden = !hit;
      if (hit) any++;
    });
    win.hidden = any === 0;
    shown += any;
  });
  count.textContent = shown + (shown === 1 ? " command" : " commands");
  empty.hidden = shown !== 0;
}
q.addEventListener("input", apply);
apply();
