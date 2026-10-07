const { spawn } = require("child_process");

const kids = [];
function run(name, cmd, args) {
  const c = spawn(cmd, args, { cwd: __dirname, shell: true, stdio: "inherit" });
  c.on("exit", (code) => console.log(name + " exited: " + code));
  kids.push(c);
  return c;
}

run("api", "npx", ["json-server", "--watch", "db.json", "--port", "3000", "--host", "0.0.0.0"]);
run("web", "node", ["server.js"]);

function shutdown() {
  kids.forEach((k) => {
    try {
      k.kill();
    } catch (e) {}
  });
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
