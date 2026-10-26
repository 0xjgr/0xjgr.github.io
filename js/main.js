// Datos de los proyectos: los usan las tarjetas y la terminal.
// Los tres primeros tienen demo propia en la pagina; el resto va en tarjetas.
window.PROYECTOS = [
  {
    repo: "crisol", nombre: "Crisol", color: "#ff7a45", demo: true,
    lema: "Static malware triage engine and test bench for YARA rules. It measured a 12.18% false positive rate on legitimate software and drove the redesign down to 0% with no loss of detection.",
    etiquetas: ["Python", "YARA", "pefile", "capstone"],
  },
  {
    repo: "cibo", nombre: "CIBO", color: "#3ddc97", demo: true,
    lema: "AI assistant that runs fully local on Ollama. It knows when to use a real tool instead of making up the answer, and keeps sensitive data from leaking to the cloud.",
    etiquetas: ["Python", "Ollama", "LangChain", "ChromaDB"],
  },
  {
    repo: "garabato", nombre: "Garabato", color: "#ffd23f", demo: true,
    lema: "You write the script, out comes the edited video: voice, images, subtitles and assembly. Every step is idempotent.",
    etiquetas: ["Python", "PyTorch", "ffmpeg", "TTS"],
  },
  {
    repo: "cromatoforo", nombre: "Cromatóforo", color: "#c792ea",
    lema: "An Arch desktop where every color comes from the wallpaper. Nineteen programs repainted in one pass from a single source.",
    etiquetas: ["Hyprland", "Lua", "pywal16", "Shell"],
  },
  {
    repo: "pinchadiscos", nombre: "Pinchadiscos", color: "#ff4fa3",
    lema: "Custom Spotify playlists by artist, genre, decade and popularity. OAuth 2.0 with the secret always kept on the server.",
    etiquetas: ["Next.js", "React", "OAuth 2.0", "Tailwind"],
  },
  {
    repo: "vitrina", nombre: "Vitrina", color: "#8b7bff",
    lema: "My collection of games, films, TV shows, books and albums, with what I think of each. Written in Obsidian, published as a website.",
    etiquetas: ["Obsidian", "TypeScript", "static site"],
    web: "https://jorgeress.github.io/vitrina/",
  },
  {
    repo: "pokegan", nombre: "PokeGAN", color: "#ff5a5f",
    lema: "A DCGAN trained from scratch for 10,000 epochs to generate Pokémon sprites that don't exist.",
    etiquetas: ["TensorFlow", "Keras", "DCGAN"],
  },
];

window.INTERESES = [
  "malware", "cybersecurity", "Linux", "privacy", "open source",
  "local AI", "machine learning", "automation", "optimization",
];

window.STACK = [
  { grupo: "Security", items: ["YARA", "pefile", "capstone", "Wireshark", "Burp Suite", "nmap", "Metasploit"] },
  { grupo: "Systems", items: ["Linux", "Arch", "Bash", "C", "C++", "Docker"] },
  { grupo: "Backend", items: ["Python", "Node.js", "Express", "JWT", "Java"] },
  { grupo: "Data", items: ["PostgreSQL", "SQL", "MongoDB", "Prisma", "Supabase"] },
  { grupo: "Frontend", items: ["JavaScript", "TypeScript", "React", "Next.js"] },
  { grupo: "AI and ML", items: ["PyTorch", "LangChain", "Ollama", "ChromaDB"] },
  { grupo: "Cloud", items: ["AWS", "Vercel"] },
];

window.reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
const reducido = window.reducido;

// --- ciclo del hero: medir > comparar > automatizar > optimizar ---
(() => {
  const ciclo = document.getElementById("ciclo");
  const nodos = ciclo.querySelectorAll(".nodo");
  const arcos = ciclo.querySelectorAll(".arco");
  let i = 0;
  const marca = () => {
    nodos.forEach((n, k) => n.classList.toggle("activo", k === i));
    arcos.forEach((a, k) => a.classList.toggle("activo", k === i));
  };
  marca();
  if (reducido) return;
  setInterval(() => { i = (i + 1) % nodos.length; marca(); }, 1600);
})();

// --- linea que se escribe sola ---
(() => {
  const el = document.getElementById("tipo");
  const frases = [
    "sudo pacman -Syu",
    "yara -r rules/ ./samples",
    "nmap -sV 192.168.1.0/24",
    'git commit -m "fixed, I think"',
    "tail -f /var/log/auth.log",
    "chmod 600 ~/.ssh/id_ed25519",
    "docker compose up -d",
    "ollama run llama3.1",
    "wal -i wallpaper.jpg",
    "make && ./a.out",
    "rm -rf node_modules && npm i",
    ":wq",
  ];
  if (reducido) { el.textContent = frases[0]; return; }
  let f = 0, n = 0, borrando = false;
  (function paso() {
    const texto = frases[f];
    n += borrando ? -1 : 1;
    el.textContent = texto.slice(0, n);
    let espera = borrando ? 28 : 55 + Math.random() * 50;
    if (!borrando && n === texto.length) { borrando = true; espera = 1800; }
    else if (borrando && n === 0) { borrando = false; f = (f + 1) % frases.length; espera = 350; }
    setTimeout(paso, espera);
  })();
})();

// --- tarjetas del resto de proyectos ---
(() => {
  const rejilla = document.getElementById("rejilla");
  for (const p of window.PROYECTOS.filter((p) => !p.demo)) {
    const a = document.createElement("a");
    a.className = "tarjeta aparece";
    a.href = p.web || `https://github.com/jorgeress/${p.repo}`;
    a.innerHTML = `
      <h4>${p.nombre}<span aria-hidden="true">→</span></h4>
      <p>${p.lema}</p>
      <div class="etiquetas">${p.etiquetas.map((e) => `<span>${e}</span>`).join("")}</div>
      <div class="meta" data-meta="${p.repo}"></div>`;
    rejilla.append(a);
  }

  // ultima actualizacion, en vivo; si la API falla, las tarjetas se quedan sin ella
  const hace = (fecha) => {
    const dias = Math.round((Date.now() - new Date(fecha)) / 864e5);
    if (dias < 1) return "today";
    if (dias < 30) return `${dias} ${dias === 1 ? "day" : "days"} ago`;
    const meses = Math.round(dias / 30);
    return `${meses} ${meses === 1 ? "month" : "months"} ago`;
  };
  window.hace = hace;
  window.REPOS = fetch("https://api.github.com/users/jorgeress/repos?per_page=100")
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);
  window.REPOS.then((repos) => {
    for (const r of repos) {
      const el = document.querySelector(`[data-meta="${r.name}"]`);
      if (!el) continue;
      el.textContent = (r.stargazers_count ? `★ ${r.stargazers_count} · ` : "") + `updated ${hace(r.pushed_at)}`;
    }
  });
})();

// --- sobre mi: intereses y stack ---
(() => {
  document.getElementById("intereses").innerHTML = window.INTERESES.map((t) => `<li>${t}</li>`).join("");
  document.getElementById("stack").innerHTML = window.STACK
    .map((g) => `<div class="grupo"><h4>${g.grupo}</h4><p>${g.items.join(" · ")}</p></div>`).join("");
})();

// --- aparicion al hacer scroll ---
(() => {
  document.querySelectorAll("section h2, .destacado, .bloque").forEach((el) => el.classList.add("aparece"));
  const obs = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("visible");
      obs.unobserve(e.target);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll(".aparece").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 70}ms`;
    obs.observe(el);
  });
})();
