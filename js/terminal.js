// Terminal de juguete: se abre con º o ` (o con el boton >_ de arriba).
(() => {
  const caja = document.getElementById("terminal");
  const salida = document.getElementById("salida");
  const form = document.getElementById("linea");
  const input = document.getElementById("orden");
  const historial = [];
  let pos = 0;
  let anterior = null;
  const inicio = performance.now();

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const escribe = (html, clase = "") => {
    const p = document.createElement("div");
    if (clase) p.className = clase;
    p.innerHTML = html;
    salida.append(p);
    salida.scrollTop = salida.scrollHeight;
    return p;
  };
  const busca = (nombre) => window.PROYECTOS
    .find((p) => p.repo === nombre?.toLowerCase() || p.nombre.toLowerCase() === nombre?.toLowerCase());
  const bloques = () => `<span class="bloques">${window.cromatoforo.colores().map((c) => `<i style="background:${c}"></i>`).join("")}</span>`;

  // datos de la propia web, para neofetch
  function datosWeb() {
    const recursos = performance.getEntriesByType("resource").concat(performance.getEntriesByType("navigation"));
    const kb = recursos.reduce((t, r) => t + (r.transferSize || 0), 0) / 1024;
    const ua = navigator.userAgent;
    const nav = /Firefox\//.test(ua) ? "Firefox" : /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chromium" : /Safari\//.test(ua) ? "Safari" : "other";
    const so = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "?";
    const seg = Math.round((performance.now() - inicio) / 1000);
    return {
      peso: kb > 0 ? `${kb.toFixed(0)} kB transferred` : "whatever your cache had",
      visitante: `${nav} on ${so}${so === "Linux" ? " (good choice)" : ""}`,
      pantalla: `${screen.width}x${screen.height} @ ${devicePixelRatio}x`,
      uptime: seg < 60 ? `${seg} s` : `${Math.floor(seg / 60)} min ${seg % 60} s`,
    };
  }

  const ORDENES = {
    help: () => [
      "available commands:",
      "  whoami            who I am",
      "  ls                list the projects",
      "  cat <project>     what a project is about",
      "  open <project>    open the repo on GitHub",
      "  wal [wallpaper]   change the site palette (no argument: the next one)",
      "  stack             what I work with",
      "  interests         what I'm into",
      "  neofetch          this site, on one screen",
      "  contact           how to reach me",
      "  clear             clear the screen",
      "  exit              close the terminal",
    ].join("\n"),
    whoami: () => "Jorge García. Software Engineering and Cybersecurity student.\nMalware, Linux and security. AI that runs on your own machine.\nIf something repeats, I automate it. Sometimes I come up with things.",
    ls: () => window.PROYECTOS
      .map((p) => `<span style="color:${p.color}">${p.repo}/</span>`).join("  "),
    cat: (arg) => {
      if (!arg) return { err: "cat: missing project. Try: cat crisol" };
      const p = busca(arg.replace(/\/$/, ""));
      if (!p) return { err: `cat: ${esc(arg)}: no such project` };
      return `<b style="color:${p.color}">${p.nombre}</b>\n${p.lema}\n<span class="orden">${p.etiquetas.join(" · ")}</span>`
        + (p.demo ? `\n<span class="orden">has a demo on this page: </span><a href="#" data-ve="${p.repo}">see demo</a>` : "");
    },
    open: (arg) => {
      const p = busca(arg?.replace(/\/$/, ""));
      if (!p) return { err: `open: ${esc(arg || "")}: no such project` };
      const url = `https://github.com/jorgeress/${p.repo}`;
      window.open(url, "_blank", "noopener");
      return `opening <a href="${url}" target="_blank" rel="noopener">${url}</a>`;
    },
    wal: (arg) => {
      const lista = window.cromatoforo.fondos();
      const nombre = arg.replace(/^-i\s*/, "").trim();
      if (nombre === "-l" || nombre === "--list") return `wallpapers: ${lista.join("  ")}\nor drop your own image anywhere on the page`;
      if (nombre && !lista.includes(nombre)) return { err: `wal: ${esc(nombre)}: not found. Available: ${lista.join(", ")}` };
      const linea = escribe('<span class="orden">[i] generating palette…</span>');
      (nombre ? window.cromatoforo.aplica(nombre) : window.cromatoforo.siguiente()).then((n) => {
        setTimeout(() => { linea.innerHTML = `<span class="ok">[i] palette: ${esc(n)}</span>  ${bloques()}\n<span class="orden">[i] 1 consumer repainted: this site</span>`; }, 800);
      });
      return null;
    },
    stack: () => window.STACK.map((g) => `<b>${g.grupo.padEnd(10)}</b> ${g.items.join(" · ")}`).join("\n"),
    interests: () => window.INTERESES.join(" · ") + "\n<span class=\"orden\">now: Linux hardening, ML, then Rust and Go</span>",
    contact: () => '<a href="mailto:jgarciamartinezdev@proton.me">jgarciamartinezdev@proton.me</a>\n'
      + '<a href="https://www.linkedin.com/in/jorgegarciamartinezdev" target="_blank" rel="noopener">linkedin</a>  '
      + '<a href="https://github.com/jorgeress" target="_blank" rel="noopener">github</a>',
    neofetch: () => {
      const d = datosWeb();
      const logo = [
        " __           ",
        " \\ \\          ",
        "  \\ \\         ",
        "  / /         ",
        " /_/  _____   ",
        "     |_____|  ",
      ];
      const lineas = [
        '<span class="ok">visitor</span>@<span class="ok">jorgeress.github.io</span>',
        "------------------------------",
        `<b>Host</b>: GitHub Pages`,
        `<b>Web</b>: HTML + CSS + JS, 0 frameworks`,
        `<b>Size</b>: ${d.peso}`,
        `<b>Palette</b>: ${esc(window.cromatoforo.actual())}`,
        `<b>Projects</b>: ${window.PROYECTOS.length}`,
        `<b>You</b>: ${d.visitante}, ${d.pantalla}`,
        `<b>Uptime</b>: ${d.uptime} in this tab`,
        "",
        bloques(),
      ];
      const estrecha = salida.clientWidth < 560;
      const salidaHtml = lineas.map((l, i) => (estrecha ? "" : `<span style="color:var(--c2)">${esc(logo[i] || "              ")}</span>`) + l).join("\n");
      // la fecha del ultimo despliegue llega de la API, cuando llegue
      window.REPOS.then((repos) => {
        const r = repos.find((x) => x.name === "jorgeress.github.io");
        if (r) escribe(`<span class="orden">${salida.clientWidth < 560 ? "" : " ".repeat(14)}</span><b>Last deploy</b>: ${window.hace(r.pushed_at)}`);
      });
      return salidaHtml;
    },
    sudo: () => ({ err: "jorge is not in the sudoers file. This incident will be reported." }),
    clear: () => { salida.innerHTML = ""; return null; },
    exit: () => { cierra(); return null; },
  };
  ORDENES.ayuda = ORDENES.help;
  ORDENES.intereses = ORDENES.interests;
  ORDENES.contacto = ORDENES.contact;
  ORDENES.dir = ORDENES.ls;

  function ejecuta(linea) {
    escribe(`<span class="acento">jorge@arch</span> ~ $ ${esc(linea)}`, "orden");
    const [orden, ...args] = linea.trim().split(/\s+/);
    if (!orden) return;
    const f = ORDENES[orden.toLowerCase()];
    if (!f) return escribe(`${esc(orden)}: command not found. Type <b>help</b>.`, "err");
    const r = f(args.join(" "));
    if (r == null) return;
    if (typeof r === "string") escribe(r);
    else if (r.err) escribe(r.err, "err");
    else if (r.ok) escribe(r.ok, "ok");
  }

  function abre() {
    if (!caja.hidden) return;
    anterior = document.activeElement;
    caja.hidden = false;
    if (!salida.childElementCount) escribe("Welcome. Type <b>help</b> to see what you can do.", "ok");
    input.focus();
  }
  function cierra() {
    caja.hidden = true;
    anterior?.focus?.();
  }

  salida.addEventListener("click", (e) => {
    const a = e.target.closest("[data-ve]");
    if (!a) return;
    e.preventDefault();
    cierra();
    document.querySelector(`[data-proyecto="${a.dataset.ve}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value;
    if (v.trim()) historial.push(v);
    pos = historial.length;
    input.value = "";
    ejecuta(v);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && pos > 0) { input.value = historial[--pos]; e.preventDefault(); }
    else if (e.key === "ArrowDown") { pos = Math.min(historial.length, pos + 1); input.value = historial[pos] || ""; e.preventDefault(); }
    else if (e.key === "Tab") {
      e.preventDefault();
      const [o, a] = input.value.split(/\s+/);
      if (a !== undefined) {
        const opciones = o === "wal" ? window.cromatoforo.fondos() : window.PROYECTOS.map((p) => p.repo);
        const m = opciones.find((x) => x.startsWith(a.toLowerCase()));
        if (m) input.value = `${o} ${m}`;
      } else {
        const m = Object.keys(ORDENES).find((k) => k.startsWith(o.toLowerCase()));
        if (m) input.value = m + " ";
      }
    } else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); salida.innerHTML = ""; }
  });

  document.addEventListener("keydown", (e) => {
    const enOtroCampo = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName) && document.activeElement !== input;
    if ((e.key === "`" || e.key === "º") && !enOtroCampo) {
      e.preventDefault();
      caja.hidden ? abre() : cierra();
    } else if (e.key === "Escape" && !caja.hidden) cierra();
  });
  document.querySelectorAll("[data-abre-terminal]").forEach((b) => b.addEventListener("click", abre));
  document.querySelectorAll("[data-cierra-terminal]").forEach((b) => b.addEventListener("click", cierra));
  caja.addEventListener("click", (e) => { if (e.target === caja) cierra(); });
})();
