// Tarjetas de proyecto: al pulsar, la tarjeta crece hasta una ventana grande con
// el detalle (video o fotos, tres claves y la recreacion interactiva).
(() => {
  const ventana = document.getElementById("ventana");
  const caja = ventana.querySelector(".ventana-caja");
  const reducido = window.reducido;
  const arts = [...document.querySelectorAll(".proyecto")];
  let abierto = null; // el <article> abierto

  // la tarjeta se transforma en la ventana; los nombres se limpian al acabar
  const limpia = () => document.querySelectorAll(".p-tarjeta, .ventana-caja").forEach((el) => { el.style.viewTransitionName = ""; });
  let enCurso = null;
  const transicion = (cambio) => {
    if (reducido || !document.startViewTransition || enCurso) { limpia(); cambio(); return; }
    enCurso = document.startViewTransition(cambio);
    enCurso.ready.catch(() => {});
    enCurso.finished.catch(() => {}).finally(() => { enCurso = null; limpia(); });
  };

  const detalle = (art) => art.querySelector(".p-detalle") || caja.querySelector(`#det-${art.id}`);
  const nombre = (art) => art.querySelector(".p-abrir").textContent;

  // mete el detalle de art en la ventana y saca el que hubiera
  function pon(art) {
    if (abierto) devuelve(abierto);
    const det = detalle(art);
    caja.append(det);
    det.hidden = false;
    ventana.setAttribute("aria-label", nombre(art));
    art.querySelector(".p-abrir").setAttribute("aria-expanded", "true");
    abierto = art;
    ventana.scrollTop = 0;
  }
  function devuelve(art) {
    const det = detalle(art);
    det.querySelectorAll("video").forEach((v) => v.pause());
    det.hidden = true;
    art.append(det);
    art.querySelector(".p-abrir").setAttribute("aria-expanded", "false");
  }

  function abre(art) {
    if (ventana.open) { pon(art); return; }
    limpia();
    const tarjeta = art.querySelector(".p-tarjeta");
    tarjeta.style.viewTransitionName = "abierto";
    transicion(() => {
      tarjeta.style.viewTransitionName = "";
      caja.style.viewTransitionName = "abierto";
      pon(art);
      ventana.showModal();
    });
  }

  function cierra() {
    const art = abierto;
    if (!art) return;
    abierto = null;
    limpia();
    const tarjeta = art.querySelector(".p-tarjeta");
    transicion(() => {
      caja.style.viewTransitionName = "";
      tarjeta.style.viewTransitionName = "abierto";
      devuelve(art);
      ventana.close();
    });
    art.querySelector(".p-abrir").focus({ preventScroll: true });
  }

  arts.forEach((art) => art.querySelector(".p-abrir").addEventListener("click", () => abre(art)));
  ventana.addEventListener("click", (e) => {
    if (e.target === ventana || e.target.closest(".p-cerrar")) cierra();
  });
  // Esc cierra el dialogo de forma nativa; aqui se devuelve el detalle a su sitio
  ventana.addEventListener("cancel", (e) => { e.preventDefault(); cierra(); });

  // la terminal y los enlaces #proyecto abren la tarjeta
  window.abreProyecto = (repo) => {
    const art = document.getElementById(repo);
    if (arts.includes(art)) { abre(art); return true; }
    return false;
  };

  // galeria de fotos
  document.querySelectorAll(".galeria").forEach((g) => {
    const grande = g.querySelector(".g-grande");
    g.querySelector(".g-minis").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const img = b.querySelector("img");
      grande.src = img.src;
      grande.alt = img.alt;
      g.querySelectorAll(".g-minis button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    });
  });

  // pie de cada tarjeta: las tecnologias, debajo de la cifra
  for (const art of arts) {
    const p = window.PROYECTOS.find((x) => x.repo === art.id);
    if (!p) continue;
    const ul = document.createElement("ul");
    ul.className = "p-tags";
    ul.innerHTML = p.etiquetas.map((t) => `<li>${t}</li>`).join("");
    art.querySelector(".p-tarjeta").append(ul);
  }

  // vista previa al pasar el raton: un clip sin sonido, o las fotos de Paperweight
  const conRaton = matchMedia("(hover: hover)").matches;
  for (const art of arts) {
    const tarjeta = art.querySelector(".p-tarjeta");
    const mini = tarjeta.querySelector(".p-mini");
    const marco = document.createElement("div");
    marco.className = "p-marco-mini";
    mini.replaceWith(marco);
    marco.append(mini);
    const fotos = [...art.querySelectorAll(".g-minis img")].map((i) => i.getAttribute("src"));
    if (!conRaton || reducido || (!art.dataset.previa && !fotos.length)) continue;
    let video, img, reloj;
    const entra = () => {
      if (art.dataset.previa) {
        if (!video) {
          video = Object.assign(document.createElement("video"), { muted: true, loop: true, playsInline: true, preload: "auto", src: art.dataset.previa });
          video.className = "p-previa";
          video.setAttribute("aria-hidden", "true");
          marco.append(video);
        }
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        if (!img) { img = document.createElement("img"); img.className = "p-previa"; img.alt = ""; marco.append(img); }
        let n = 0;
        const sigue = () => { img.src = fotos[n++ % fotos.length]; };
        sigue();
        reloj = setInterval(sigue, 900);
      }
      tarjeta.classList.add("viendo");
    };
    const sale = () => {
      tarjeta.classList.remove("viendo");
      video?.pause();
      clearInterval(reloj);
    };
    tarjeta.addEventListener("pointerenter", entra);
    tarjeta.addEventListener("pointerleave", sale);
  }

  // recreaciones: dice que se puede tocar y deja de llamar la atencion al primer toque
  const PIDE = {
    "demo-paper": ["Guard", "Pick a parcel"],
    "demo-timo": ["Guard", "Pick an errand"],
    "demo-crisol": ["Rule version", null],
    "demo-cibo": [null, "Ask CIBO something"],
    "demo-garabato": [null, "Pick a line of the script"],
  };
  const etiqueta = (texto) => Object.assign(document.createElement("p"), { className: "d-pide", textContent: texto });
  for (const [id, [conm, elige]] of Object.entries(PIDE)) {
    const el = document.getElementById(id);
    if (!el) continue;
    const c = el.querySelector(".conmutador");
    if (conm && c) c.before(etiqueta(conm));
    const sug = el.querySelector(".sugerencias, .guion");
    if (elige && sug) sug.before(etiqueta(elige));
    el.addEventListener("pointerdown", () => el.classList.add("tocada"), { once: true });
  }
})();
