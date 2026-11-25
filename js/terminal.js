// Terminal embebida en la cabecera: escribe whoami, hace clear y deja un menu
// de ordenes clicables que llevan a cada seccion. Tambien se puede escribir.
(() => {
  const term = document.getElementById("term");
  const salida = document.getElementById("salida");
  const form = document.getElementById("linea");
  const input = document.getElementById("orden");
  const reducido = window.reducido;
  const historial = [];
  let pos = 0;
  let saltar = false;
  let enIntro = false;
  const inicio = performance.now();

  const PROMPT = '<span class="acento">jorge@arch</span> ~ $ ';
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const dormir = (ms) => new Promise((ok) => setTimeout(ok, saltar ? 0 : ms));
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
  const ve = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
  };

  // orden del menu, a donde lleva y que dice
  const MENU = [
    ["projects", "proyectos", "what I've built, open one to see it run"],
    ["more", "mas", "smaller projects"],
    ["about", "sobre-mi", "what I work on and with"],
    ["contact", "contacto", "write to me"],
  ];

  const menu = () => `<div class="t-inicio">
    <div class="t-nombre">Jorge García</div>
    <div class="t-rol">Software engineering student, final year. Into cybersecurity and AI.</div>
    <ul class="t-menu">${MENU.map(([o, , d]) => `
      <li><button type="button" data-orden="${o}"><span class="t-o">${o}</span><span class="t-d">${d}</span></button></li>`).join("")}
    </ul>
    <div class="t-pista">Click one, or type <b>help</b>.</div></div>`;

  const SECCIONES = Object.fromEntries(MENU.map(([o, id]) => [o, id]));

  const ORDENES = {
    help: () => [
      "available commands:",
      ...MENU.map(([o, , d]) => `  ${o.padEnd(16)}${d}`),
      "  ls              list every project",
      "  cat <project>   what a project is about",
      "  open <project>  open the repo on GitHub",
      "  stack           what I work with",
      "  neofetch        this site, on one screen",
      "  clear           back to the menu",
    ].join("\n"),
    whoami: () => "Jorge García. Final-year software engineering student.\nInto cybersecurity and AI: guards for AI agents, malware detection, local AI.",
    ls: () => window.PROYECTOS.map((p) => `<span class="ok">${p.repo}/</span>`).join("  "),
    cat: (arg) => {
      if (!arg) return { err: "cat: missing project. Try: cat timo" };
      const p = busca(arg.replace(/\/$/, ""));
      if (!p) return { err: `cat: ${esc(arg)}: no such project` };
      return `<b>${p.nombre}</b>\n${p.lema}\n<span class="orden">${p.etiquetas.join(", ")}</span>`
        + (document.querySelector(`[data-proyecto="${p.repo}"]`) ? `\n<a href="#" data-ve="${p.repo}">open it on this page</a>` : "");
    },
    open: (arg) => {
      const p = busca(arg?.replace(/\/$/, ""));
      if (!p) return { err: `open: ${esc(arg || "")}: no such project` };
      const url = p.web || `https://github.com/0xjgr/${p.repo}`;
      window.open(url, "_blank", "noopener");
      return `opening <a href="${url}" target="_blank" rel="noopener">${url}</a>`;
    },
    cd: (arg) => {
      const id = SECCIONES[arg?.replace(/^[~/.]+/, "")];
      if (!id) return { err: `cd: ${esc(arg || "")}: no such section. Try: ${MENU.map((m) => m[0]).join(", ")}` };
      ve(id);
      return `<span class="orden">→ ${esc(arg)}</span>`;
    },
    stack: () => window.STACK.map((g) => `<b>${g.grupo.padEnd(10)}</b> ${g.items.join(", ")}`).join("\n"),
    neofetch: () => {
      const recursos = performance.getEntriesByType("resource").concat(performance.getEntriesByType("navigation"));
      const kb = recursos.reduce((t, r) => t + (r.transferSize || 0), 0) / 1024;
      const seg = Math.round((performance.now() - inicio) / 1000);
      return [
        '<span class="ok">visitor</span>@<span class="ok">0xjgr.github.io</span>',
        "------------------------------",
        "<b>Host</b>: GitHub Pages",
        "<b>Web</b>: HTML + CSS + JS, 0 frameworks",
        `<b>Size</b>: ${kb > 0 ? `${kb.toFixed(0)} kB transferred` : "whatever your cache had"}`,
        `<b>Projects</b>: ${window.PROYECTOS.length}`,
        `<b>Uptime</b>: ${seg < 60 ? `${seg} s` : `${Math.floor(seg / 60)} min`} in this tab`,
      ].join("\n");
    },
    sudo: () => ({ err: "jorge is not in the sudoers file. This incident will be reported." }),
    clear: () => { salida.innerHTML = menu(); return null; },
  };
  ORDENES.github = () => {
    window.open("https://github.com/0xjgr", "_blank", "noopener");
    return 'opening <a href="https://github.com/0xjgr" target="_blank" rel="noopener">github.com/0xjgr</a>';
  };
  for (const [o] of MENU) ORDENES[o] = () => ORDENES.cd(o);

  function ejecuta(linea) {
    escribe(PROMPT + esc(linea), "orden");
    const [orden, ...args] = linea.trim().split(/\s+/);
    if (!orden) return;
    const f = ORDENES[orden.toLowerCase()];
    if (!f) return escribe(`${esc(orden)}: command not found. Type <b>help</b>.`, "err");
    const r = f(args.join(" "));
    if (r == null) return;
    if (typeof r === "string") escribe(r);
    else if (r.err) escribe(r.err, "err");
  }

  // --- la intro: whoami, clear, menu ---
  async function teclea(texto) {
    const linea = escribe(PROMPT + '<span class="tecleo"></span><span class="cursor"></span>', "orden");
    const t = linea.querySelector(".tecleo");
    await dormir(380);
    for (const c of texto) {
      t.textContent += c;
      await dormir(70 + Math.random() * 50);
    }
    await dormir(260);
    linea.querySelector(".cursor").remove();
  }

  async function intro() {
    if (enIntro) return;
    enIntro = true;
    saltar = reducido;
    salida.innerHTML = "";
    term.classList.add("en-intro");
    await teclea("whoami");
    escribe('<span class="t-nombre-intro">Jorge García</span>');
    await dormir(140);
    escribe('<span class="orden">software engineering student, into security and AI</span>');
    await dormir(1100);
    await teclea("clear");
    salida.innerHTML = menu();
    salida.querySelector(".t-menu").classList.add("entra");
    term.classList.remove("en-intro");
    enIntro = false;
  }
  window.terminalIntro = intro;

  // cualquier tecla o clic durante la intro la termina al momento
  const corta = () => { if (enIntro) saltar = true; };
  term.addEventListener("pointerdown", corta);
  document.addEventListener("keydown", corta, { capture: true });

  salida.addEventListener("click", (e) => {
    const b = e.target.closest("[data-orden]");
    if (b) { ejecuta(b.dataset.orden); return; }
    const a = e.target.closest("[data-ve]");
    if (!a) return;
    e.preventDefault();
    if (!window.abreProyecto?.(a.dataset.ve)) document.querySelector(`[data-proyecto="${a.dataset.ve}"]`)?.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "center" });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value;
    if (v.trim()) historial.push(v);
    pos = historial.length;
    input.value = "";
    if (enIntro) saltar = true;
    ejecuta(v);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && pos > 0) { input.value = historial[--pos]; e.preventDefault(); }
    else if (e.key === "ArrowDown") { pos = Math.min(historial.length, pos + 1); input.value = historial[pos] || ""; e.preventDefault(); }
    else if (e.key === "Tab") {
      e.preventDefault();
      const [o, a] = input.value.split(/\s+/);
      if (a !== undefined) {
        const opciones = o === "cd" ? MENU.map((m) => m[0]) : window.PROYECTOS.map((p) => p.repo);
        const m = opciones.find((x) => x.startsWith(a.toLowerCase()));
        if (m) input.value = `${o} ${m}`;
      } else {
        const m = Object.keys(ORDENES).find((k) => k.startsWith(o.toLowerCase()));
        if (m) input.value = m + " ";
      }
    } else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); ORDENES.clear(); }
  });

  // ` o º: ir a la terminal desde cualquier sitio
  document.addEventListener("keydown", (e) => {
    const enOtroCampo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) && document.activeElement !== input;
    if ((e.key === "`" || e.key === "º") && !enOtroCampo) {
      e.preventDefault();
      term.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "center" });
      input.focus({ preventScroll: true });
    }
  });

  intro();
})();
