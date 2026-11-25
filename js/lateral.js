// Al bajar desde la cabecera, la terminal se encoge y vuela al lateral, donde
// queda en pequeño como navegacion. Va ligado al scroll: si subes, vuelve.
// El progreso se suaviza (persigue al scroll) para que la rueda del raton no
// lo mueva a saltos, y el contenido pasa de una ventana a otra en fundido.
(() => {
  const term = document.getElementById("term");
  const hero = document.querySelector(".hero");
  const lat = document.querySelector(".lat-term");
  if (!term || !lat) return;
  const ancho = matchMedia("(min-width: 901px)");
  const reducido = window.reducido;

  const fantasma = document.createElement("div");
  fantasma.className = "term-fantasma";
  fantasma.setAttribute("aria-hidden", "true");
  fantasma.inert = true;
  const capaHero = document.createElement("div");
  capaHero.className = "f-hero";
  const capaLat = document.createElement("div");
  capaLat.className = "f-lat lat-term";
  fantasma.append(capaHero, capaLat);
  document.body.append(fantasma);

  // copias sin ids de las dos ventanas, rehechas cada vez que empieza el vuelo
  const copia = (origen) => {
    const c = origen.cloneNode(true);
    c.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    c.querySelectorAll("[aria-live]").forEach((n) => n.removeAttribute("aria-live"));
    return c;
  };
  let a0 = null; // tamaño de la terminal al empezar
  function prepara() {
    const a = term.getBoundingClientRect();
    a0 = { w: a.width, h: a.height, x: a.left, y: a.top + scrollY }; // donde esta con la pagina arriba del todo
    const h = copia(term);
    h.className = "term f-term";
    h.style.width = `${a.width}px`;
    h.style.height = `${a.height}px`;
    capaHero.replaceChildren(h);
    const s = h.querySelector(".term-salida");
    if (s) s.scrollTop = term.querySelector(".term-salida").scrollTop;
    capaLat.replaceChildren(...[...lat.children].map(copia));
    capaLat.style.width = `${lat.offsetWidth}px`;
  }

  const suave = (t) => t * t * (3 - 2 * t);
  const tramo = (a, b, t) => suave(Math.min(1, Math.max(0, (t - a) / (b - a))));
  const mezcla = (a, b, t) => a + (b - a) * t;

  let actual = 0, ultimo = 0, bucle = 0, volando = false;
  const objetivo = () => Math.min(1, Math.max(0, scrollY / (hero.offsetHeight * 0.92)));

  function fija(p) {
    if (p <= 0) {
      fantasma.style.display = "none"; term.style.opacity = ""; lat.classList.add("escondido"); volando = false; return;
    }
    if (p >= 1) {
      fantasma.style.display = "none"; term.style.opacity = "0"; lat.classList.remove("escondido"); volando = false; return;
    }
    if (!volando) { prepara(); volando = true; }
    lat.classList.add("escondido");
    term.style.opacity = "0";
    // sale de donde estaba la terminal con la pagina arriba, no de donde la ha subido el scroll
    const a = { left: a0.x, top: a0.y, width: a0.w, height: a0.h };
    const r = lat.getBoundingClientRect();
    const destinoTop = parseFloat(getComputedStyle(lat.parentElement).paddingTop);
    const t = suave(p); // acelera y frena con el scroll, sin hacer casi todo el viaje al principio
    const x = mezcla(a.left, r.left, t), y = mezcla(a.top, destinoTop, t);
    const w = mezcla(a.width, r.width, t), h = mezcla(a.height, r.height, t);
    Object.assign(fantasma.style, {
      display: "block", transform: `translate3d(${x}px, ${y}px, 0)`, width: `${w}px`, height: `${h}px`,
      boxShadow: `0 30px 70px -30px rgba(0, 0, 0, ${0.7 * (1 - t)})`,
    });
    // la terminal se encoge entera, con lo que tenia escrito, y se apaga al acercarse
    capaHero.style.transform = `scale(${w / a0.w})`;
    capaHero.style.opacity = String(1 - tramo(0.35, 0.8, p));
    capaLat.style.opacity = String(tramo(0.5, 0.95, p));
  }

  function paso(ahora) {
    const dt = Math.min(64, ahora - (ultimo || ahora));
    ultimo = ahora;
    const meta = objetivo();
    // persigue al scroll: rapido pero sin escalones
    actual += (meta - actual) * (1 - Math.pow(1 - 0.16, dt / 16.7));
    if (Math.abs(meta - actual) < 0.0008) actual = meta;
    fija(actual);
    if (actual !== meta) bucle = requestAnimationFrame(paso);
    else { bucle = 0; ultimo = 0; }
  }
  function pide() {
    if (!ancho.matches) {
      cancelAnimationFrame(bucle); bucle = 0;
      fantasma.style.display = "none"; term.style.opacity = ""; lat.classList.remove("escondido"); volando = false;
      return;
    }
    if (reducido) { lat.classList.toggle("escondido", objetivo() < 1); return; }
    if (!bucle) bucle = requestAnimationFrame(paso);
  }
  addEventListener("scroll", pide, { passive: true });
  addEventListener("resize", () => { volando = false; pide(); });
  actual = objetivo();
  if (ancho.matches && !reducido) fija(actual); else pide();
})();
