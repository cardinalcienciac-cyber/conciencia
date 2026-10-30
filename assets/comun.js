// ConCiencia: cabecera, menú, pie de página e idioma (compartido por todas las páginas)
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
  const L = (es, en) => `<span lang="es">${esc(es)}</span><span lang="en">${esc(en)}</span>`;
  window.L = L;

  const NAV = [
    {href: "como-funciona.html", es: "Cómo funciona", en: "How it works"},
    {href: "proyectos.html", es: "Proyectos y servicios", en: "Projects and services", sub: [
      {href: "proyectos.html#hardware", es: "Instrumentos de laboratorio de bajo costo", en: "Low-cost lab instruments", nota: ["Hardware abierto", "Open hardware"]},
      {href: "proyectos.html#consultoria", es: "Apoyo a la investigación", en: "Research support", nota: ["Consultoría", "Consulting"]},
      {href: "ciencia-ciudadana.html", es: "Ciencia ciudadana en territorio", en: "Citizen science in the field", sub: [
        {href: "ods.html", es: "Objetivos de Desarrollo Sostenible", en: "Sustainable Development Goals"}
      ]}
    ]},
    {href: "datos.html", es: "Datos abiertos", en: "Open data"},
    {href: "nosotros.html", es: "Nosotros", en: "About"},
    {href: "contacto.html", es: "Contacto", en: "Contact"}
  ];
  const actual = location.pathname.split("/").pop() || "index.html";
  const cur = h => !h.includes("#") && h === actual ? ' aria-current="page"' : "";
  const CARET = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  const subItems = items => items.map(s => `<li><a href="${s.href}"${cur(s.href)}>${L(s.es, s.en)}${s.nota ? `<small>${L(s.nota[0], s.nota[1])}</small>` : ""}</a>${
    s.sub ? `<ul class="sub2">${subItems(s.sub)}</ul>` : ""}</li>`).join("");
  const items = NAV.map((n, i) => n.sub
    ? `<li class="dd"><div class="dd-row"><a href="${n.href}"${cur(n.href)}>${L(n.es, n.en)}</a>
         <button class="caret" type="button" aria-expanded="false" aria-controls="sub${i}" aria-label="Submenú / Submenu">${CARET}</button></div>
         <ul class="sub" id="sub${i}">${subItems(n.sub)}</ul></li>`
    : `<li><a href="${n.href}"${cur(n.href)}>${L(n.es, n.en)}</a></li>`).join("");

  const head = document.getElementById("cabecera");
  head.className = "site-head";
  head.innerHTML = `<div class="wrap head">
      <a class="logo" href="index.html"><img src="img/logo.png" alt=""><span>ConCiencia</span></a>
      <nav class="site-nav" id="site-nav" aria-label="Principal"><ul class="menu">${items}</ul></nav>
      <div class="tools">
        <div class="lang" role="group" aria-label="Idioma / Language">
          <button type="button" data-l="es" aria-pressed="true">ES</button><button type="button" data-l="en" aria-pressed="false">EN</button>
        </div>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">${L("Menú", "Menu")}</button>
      </div></div>`;
  document.getElementById("pie").outerHTML = `<footer class="site-foot"><div class="wrap">
      <span>© 2026 ConCiencia</span><span>${L("Resultados publicados como datos abiertos (CC BY 4.0)", "Results published as open data (CC BY 4.0)")}</span></div></footer>`;

  // Submenús: clic en la flecha, y en escritorio también al pasar el ratón
  const fino = matchMedia("(hover: hover) and (min-width: 901px)");
  document.querySelectorAll(".dd").forEach(dd => {
    const btn = dd.querySelector(".caret"), sub = dd.querySelector(".sub");
    let cierre = null;
    const set = o => { clearTimeout(cierre); sub.classList.toggle("open", o); btn.setAttribute("aria-expanded", String(o)); };
    btn.addEventListener("click", () => set(!sub.classList.contains("open")));
    // Se abre al pasar el ratón y se cierra con un pequeño retraso, para poder llegar a las opciones
    dd.addEventListener("mouseenter", () => { if (fino.matches) set(true); });
    dd.addEventListener("mouseleave", () => { if (fino.matches) { clearTimeout(cierre); cierre = setTimeout(() => set(false), 400); } });
    dd.addEventListener("keydown", e => { if (e.key === "Escape") { set(false); btn.focus(); } });
    document.addEventListener("click", e => { if (!dd.contains(e.target)) set(false); });
  });
  const nav = document.getElementById("site-nav"), mb = head.querySelector(".menu-btn");
  mb.addEventListener("click", () => { const o = nav.classList.toggle("open"); mb.setAttribute("aria-expanded", String(o)); });

  // Idioma
  const html = document.documentElement;
  const titulos = {es: html.dataset.tituloEs, en: html.dataset.tituloEn};
  function setLang(l) {
    html.dataset.lang = l; html.lang = l;
    head.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.l === l)));
    if (titulos[l]) document.title = titulos[l];
    try { localStorage.setItem("conciencia-lang", l); } catch (e) {}
  }
  let saved = null;
  try { saved = localStorage.getItem("conciencia-lang"); } catch (e) {}
  setLang(saved || ((navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en"));
  head.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.l)));
})();
