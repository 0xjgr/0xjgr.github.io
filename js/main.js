// Datos de los proyectos: los usan el indice y la terminal.
// Los que tienen demo: true salen en grande en index.html; el resto va al indice.
// "cifra" es un dato del README de ese repo; si el README no da ninguno, no se pone.
window.PROYECTOS = [
  {
    repo: "paperweight", nombre: "Paperweight", demo: true,
    lema: "A piece of paper shouldn't be able to command your robot. Every action a vision model sends to a real robot cites where its values came from, and seven deterministic rules check them first. Attack success drops from 90% to 0% with every legitimate parcel still sorted.",
    etiquetas: ["Python", "FastAPI", "Nemotron", "Arduino"],
  },
  {
    repo: "hearsay", nombre: "Hearsay", demo: true,
    lema: "A dispute desk for PayPal merchants whose agent cannot be talked into a refund: every value is traced to who wrote it. A plain toolkit agent obeyed 54 of 56 attacks and all 54 reached PayPal; behind Hearsay none did.",
    etiquetas: ["TypeScript", "PayPal Agent Toolkit", "Ollama"],
  },
  {
    repo: "timo", nombre: "Timo", demo: true,
    lema: "Errand agent that pays bills for people who can't spot a scam. A firewall checks where every IBAN and amount came from before money moves: the attacker gets paid 25 of 89 times with the agent alone and 0 of 90 with Timo.",
    etiquetas: ["TypeScript", "Playwright", "Muse Spark", "agents"],
  },
  {
    repo: "crisol", nombre: "Crisol", demo: true,
    lema: "Static malware triage engine and test bench for YARA rules. It measured a 12.18% false positive rate on legitimate software and drove the redesign down to 0% with no loss of detection.",
    etiquetas: ["Python", "YARA", "pefile", "capstone"],
  },
  {
    repo: "cibo", nombre: "CIBO", demo: true,
    lema: "AI assistant that runs fully local on Ollama. It knows when to use a real tool instead of making up the answer, and keeps sensitive data from leaking to the cloud.",
    etiquetas: ["Python", "Ollama", "LangChain", "ChromaDB"],
  },
  {
    repo: "garabato", nombre: "Garabato", demo: true,
    lema: "You write the script, out comes the edited video: voice, images, subtitles and assembly. Every step is idempotent.",
    etiquetas: ["Python", "PyTorch", "ffmpeg", "TTS"],
  },
  {
    repo: "cromatoforo", nombre: "Cromatóforo",
    lema: "An Arch desktop where every color comes from the wallpaper, repainted in one pass from a single source.",
    etiquetas: ["Hyprland", "Lua", "pywal16", "Shell"],
  },
  {
    repo: "pokegan", nombre: "PokeGAN", cifra: "10,000 epochs on about 800 sprites",
    lema: "A DCGAN trained from scratch to generate 64x64 Pokémon sprites that don't exist.",
    etiquetas: ["TensorFlow", "Keras", "DCGAN"],
  },
  {
    repo: "pinchadiscos", nombre: "Pinchadiscos", cifra: "19 genres, 6 decades",
    lema: "Custom Spotify playlists by artist, genre, decade and popularity. OAuth 2.0 with the secret always kept on the server.",
    etiquetas: ["Next.js", "React", "OAuth 2.0", "Tailwind"],
  },
  {
    repo: "vitrina", nombre: "Vitrina",
    lema: "My collection of games, films, TV shows, books and albums, with what I think of each. Written in Obsidian, published as a website.",
    etiquetas: ["Obsidian", "TypeScript", "static site"],
    web: "https://0xjgr.github.io/vitrina/",
  },
];

window.INTERESES = [
  "malware", "cybersecurity", "Linux", "privacy", "open source",
  "local AI", "machine learning", "automation", "optimization",
];

window.STACK = [
  { grupo: "Security", items: ["YARA", "pefile", "capstone", "Wireshark", "Burp Suite", "nmap", "Metasploit"] },
  { grupo: "Systems", items: ["Linux", "Arch", "Bash", "C", "C++", "Docker"] },
  { grupo: "Backend", items: ["Python", "FastAPI", "Node.js", "Express", "JWT", "Java"] },
  { grupo: "Data", items: ["PostgreSQL", "SQL", "MongoDB", "Prisma", "Supabase"] },
  { grupo: "Frontend", items: ["JavaScript", "TypeScript", "React", "Next.js", "Playwright"] },
  { grupo: "AI and ML", items: ["PyTorch", "LangChain", "Ollama", "ChromaDB"] },
  { grupo: "Cloud", items: ["AWS", "Vercel"] },
];

window.reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- indice del resto de proyectos ---
(() => {
  const indice = document.getElementById("rejilla");
  for (const p of window.PROYECTOS.filter((p) => !p.demo)) {
    const li = document.createElement("li");
    const datos = [p.cifra, p.etiquetas.join(", ")].filter(Boolean).join(". ");
    li.innerHTML = `
      <a href="${p.web || `https://github.com/0xjgr/${p.repo}`}">${p.nombre}</a>
      <p>${p.lema}</p>
      <div class="meta">${datos}<span data-meta="${p.repo}"></span></div>`;
    indice.append(li);
  }

  // ultima actualizacion, en vivo; si la API falla, el indice se queda sin ella
  const hace = (fecha) => {
    const dias = Math.round((Date.now() - new Date(fecha)) / 864e5);
    if (dias < 1) return "today";
    if (dias < 30) return `${dias} ${dias === 1 ? "day" : "days"} ago`;
    const meses = Math.round(dias / 30);
    return `${meses} ${meses === 1 ? "month" : "months"} ago`;
  };
  window.hace = hace;
  window.REPOS = fetch("https://api.github.com/users/0xjgr/repos?per_page=100")
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);
  window.REPOS.then((repos) => {
    for (const r of repos) {
      const el = document.querySelector(`[data-meta="${r.name}"]`);
      if (el) el.textContent = `. Updated ${hace(r.pushed_at)}`;
    }
  });
})();

// --- sobre mi: con que trabajo ---
(() => {
  document.getElementById("stack").innerHTML = window.STACK
    .map((g) => `<dt>${g.grupo}</dt><dd>${g.items.join(", ")}</dd>`).join("");
})();

// --- navegacion lateral: marca la seccion que se esta leyendo ---
(() => {
  const enlaces = [...document.querySelectorAll(".lat-nav a")];
  const secciones = enlaces.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const obs = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      enlaces.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${e.target.id}`)));
      const activo = enlaces.find((a) => a.getAttribute("href") === `#${e.target.id}`);
      const ruta = document.querySelector(".lat-ruta");
      if (activo && ruta) ruta.textContent = `~/${activo.textContent}`;
    }
  }, { rootMargin: "-35% 0px -60% 0px" });
  secciones.forEach((s) => obs.observe(s));
})();
