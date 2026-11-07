/* The Pond's app-style bottom menu, shared by every page. Also carries the
   Install button (real install prompt where the browser offers one, plain
   instructions everywhere else) and registers the service worker so the
   site behaves like an app from any entry page. */
(function () {
  /* Dark / light theme: a small toggle pinned at the top of the screen on
     every page. Light is the site's original look (nothing changes); dark
     recolors the page surfaces, cards and text through the overrides below.
     The choice is remembered on the device in localStorage 'tydTheme'. */
  var tydTheme = "light";
  try { tydTheme = localStorage.getItem("tydTheme") === "dark" ? "dark" : "light"; } catch (e) {}
  if (tydTheme === "dark") document.documentElement.setAttribute("data-theme", "dark");
  var tydSurf = "#q,.account-bar,.actbtn,.alertrow,.app,.bar,.brand-row,.btn-alt,.btn-ghost,.card,.cardrow,.codechip,.coupon,.dashitem,.deal,.fhear,.ffront,.final,.found-list span,.hint-btn,.hint-panel,.kform button,.kiconbtn.del,.mini,.mkbtn,.mkbtn.ghost,.mkcard,.mkitem,.mkitem button,.mkitem button.del,.mkvis,.nomatch,.res,.row button,.savedbar,.side-links a,.social-row a,.soundbtn,.tag,.tdcard,.tile,.toolbar,.win,.win .deal,.win a.play,.word";
  var tydInk = "#q,.account-bar .ab-label,.actbtn,.alertrow a,.alertrow b,.back,a.back,.brand-row,.card a,.card h2,.card h3,.dashitem a,.fcdate,.fko,.foot-links a,.from,.hint-kicker,.item .title,.ken,.kko,.meta,.nest,.prefrow .prefgroup,.prefrow label,.quizmsg,.res .tt,.savedbar a,.section-title,.side-links a,.side-title,.social-row a,.tag,.td-search,.tile .tname,.topdeals h2,.vowel b,.win h2,.win-deals h3,.word .wrom,details > summary .chev,label";
  var tydCss = ""
    + "#tydthemebtn{position:fixed;top:calc(10px + env(safe-area-inset-top));right:12px;z-index:9995;border-radius:999px;border:2px solid #bcd9e4;background:rgba(255,255,255,.94);color:#1f5f74;font-weight:800;font-size:13px;padding:7px 13px;cursor:pointer;box-shadow:0 3px 10px rgba(35,65,77,.22);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}"
    + "html[data-theme=\"dark\"] body{background:#0b141f !important;color:#e8f1f7 !important;}"
    + "html[data-theme=\"dark\"] " + tydSurf.split(",").join(",html[data-theme=\"dark\"] ") + "{background:#172635 !important;border-color:#2e4a5f !important;}"
    + "html[data-theme=\"dark\"] " + tydInk.split(",").join(",html[data-theme=\"dark\"] ") + "{color:#d9ecf5 !important;}"
    + "html[data-theme=\"dark\"] h1{color:#9fd8ec !important;}"
    + "html[data-theme=\"dark\"] footer{color:#9db8c6 !important;}"
    + "html[data-theme=\"dark\"] input:not([type=\"checkbox\"]):not([type=\"radio\"]):not([type=\"range\"]),html[data-theme=\"dark\"] select,html[data-theme=\"dark\"] textarea{background:#101e2c !important;color:#e8f1f7 !important;border-color:#33536b !important;}"
    + "html[data-theme=\"dark\"] ::placeholder{color:#7d99ab !important;}"
    + "html[data-theme=\"dark\"] th,html[data-theme=\"dark\"] td{border-color:#2c465a !important;}"
    + "html[data-theme=\"dark\"] #tydnav{background:rgba(13,24,36,.97) !important;border-top-color:#2c465a !important;}"
    + "html[data-theme=\"dark\"] #tydnav a,html[data-theme=\"dark\"] #tydnav button{color:#9db8c6 !important;}"
    + "html[data-theme=\"dark\"] #tydnav .on{color:#ffd94d !important;}"
    + "html[data-theme=\"dark\"] #tydinstall .box{background:#172635 !important;color:#e8f1f7 !important;}"
    + "html[data-theme=\"dark\"] #tydinstall h3{color:#9fd8ec !important;}"
    + "html[data-theme=\"dark\"] #tydthemebtn{background:rgba(16,30,44,.94);border-color:#33536b;color:#ffd94d;}";
  var tydSt = document.createElement("style");
  tydSt.id = "tydthemecss";
  tydSt.textContent = tydCss;
  document.head.appendChild(tydSt);
  function tydPaintBtn() {
    var b = document.getElementById("tydthemebtn");
    if (b) b.textContent = tydTheme === "dark" ? "☀️ Light" : "🌙 Dark";
  }
  function tydAddBtn() {
    if (document.getElementById("tydthemebtn") || !document.body) return;
    var b = document.createElement("button");
    b.id = "tydthemebtn";
    b.type = "button";
    b.setAttribute("aria-label", "Switch between dark and light mode");
    b.addEventListener("click", function () {
      tydTheme = tydTheme === "dark" ? "light" : "dark";
      if (tydTheme === "dark") document.documentElement.setAttribute("data-theme", "dark");
      else document.documentElement.removeAttribute("data-theme");
      try { localStorage.setItem("tydTheme", tydTheme); } catch (e) {}
      tydPaintBtn();
    });
    document.body.appendChild(b);
    tydPaintBtn();
  }
  if (document.body) tydAddBtn();
  else document.addEventListener("DOMContentLoaded", tydAddBtn);

  if (document.getElementById("tydnav")) return;
  var inBrands = /\/brands\//.test(location.pathname);
  var base = inBrands ? "../" : "";
  var file = location.pathname.split("/").pop() || "index.html";

  var css = ""
    + "#tydnav{position:fixed;left:0;right:0;bottom:0;z-index:9990;background:rgba(255,255,255,.96);border-top:2px solid #bcd9e4;display:flex;justify-content:space-around;padding:6px 2px calc(6px + env(safe-area-inset-bottom));font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}"
    + "#tydnav a,#tydnav button{flex:1;background:none;border:none;cursor:pointer;text-decoration:none;color:#5b7d89;font-size:10.5px;font-weight:600;display:flex;flex-direction:column;align-items:center;gap:2px;padding:2px 0;font-family:inherit;}"
    + "#tydnav .ic{font-size:19px;line-height:1;}"
    + "#tydnav{transition:transform .25s ease;}"
    + "body.tyd-nav-closed #tydnav{transform:translateY(112%);}"
    + "body.tyd-nav-closed{padding-bottom:20px !important;}"
    + "body.tyd-nav-closed .tyd-pill{bottom:76px !important;}"
    + "body.tyd-nav-closed .gpill{bottom:16px !important;}"
    + "body.tyd-nav-closed .tyd-toast{bottom:140px !important;}"
    + "#tydnavfab{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:9992;background:#ffd94d;color:#6b5900;border:2px solid #e8c832;border-radius:999px;padding:10px 16px;font-weight:800;font-size:13.5px;cursor:pointer;box-shadow:0 4px 14px rgba(35,65,77,.25);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;transition:bottom .25s ease;}"
    + "body.tyd-nav-open #tydnavfab{bottom:calc(80px + env(safe-area-inset-bottom));}"
    + "#tydnav .on{color:#1f5f74;font-weight:800;}"
    + "body{padding-bottom:88px !important;}"
    + ".tyd-pill{bottom:100px !important;}"
    + ".gpill{bottom:100px !important;left:12px;}"
    + ".tyd-toast{bottom:172px !important;}"
    + "body.tyd-nav-open .tyd-pill{bottom:150px !important;}"
    + "body.tyd-nav-open .tyd-toast{bottom:216px !important;}"
    + "body.tyd-nav-open .rhelp-launch{bottom:150px !important;}"
    + "body.tyd-nav-open .rhelp-panel{bottom:150px !important;}"
    + "#tydinstall{position:fixed;inset:0;z-index:9999;background:rgba(35,65,77,.45);display:none;align-items:center;justify-content:center;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}"
    + "#tydinstall.show{display:flex;}"
    + "#tydnav .spin .ic{display:inline-block;animation:tydspin 0.8s linear infinite;}"
    + "@keyframes tydspin{to{transform:rotate(360deg);}}"
    + "#tydinstall .box{background:#fff;border-radius:18px;padding:22px;max-width:360px;width:100%;color:#23414d;}"
    + "#tydinstall h3{margin:0 0 8px;color:#1f5f74;font-size:18px;}"
    + "#tydinstall p{font-size:14.5px;line-height:1.55;margin:6px 0;}"
    + "#tydinstall button{margin-top:12px;width:100%;border:none;background:#1f5f74;color:#fff;font-weight:800;font-size:15px;border-radius:999px;padding:11px;cursor:pointer;font-family:inherit;}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var items = [
    { ic: "🏠", label: "Home", href: base + "index.html", match: ["index.html", ""] },
    { ic: "🔥", label: "Deals", href: base + "index.html#topdeals", match: [] },
    { ic: "🔎", label: "Search", href: base + "search.html", match: ["search.html"] },
    { ic: "🧺", label: "Lists", href: base + "my-lists.html", match: ["my-lists.html"] },
    { ic: "🍳", label: "Recipes", href: base + "recipes.html", match: ["recipes.html"] },
    { ic: "🦆", label: "Account", href: base + "account.html", match: ["account.html"] }
  ];
  var nav = document.createElement("nav");
  nav.id = "tydnav";
  nav.setAttribute("aria-label", "Pond menu");
  items.forEach(function (it) {
    var a = document.createElement("a");
    a.href = it.href;
    if (it.match.indexOf(file) > -1) a.className = "on";
    a.innerHTML = '<span class="ic">' + it.ic + '</span>' + it.label;
    nav.appendChild(a);
  });
  var refr = document.createElement("button");
  refr.type = "button";
  refr.innerHTML = '<span class="ic">↻</span>Refresh';
  refr.addEventListener("click", function () {
    if (refr.classList.contains("spin")) return;
    refr.classList.add("spin");
    var done = function () { location.reload(); };
    var steps = [];
    try {
      if ("caches" in window) steps.push(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); }));
      if ("serviceWorker" in navigator) steps.push(navigator.serviceWorker.getRegistration().then(function (reg) { if (reg) return reg.update(); }).catch(function () {}));
    } catch (e) {}
    Promise.all(steps).then(function () { setTimeout(done, 60); }).catch(function () { done(); });
    setTimeout(done, 2500);
  });
  nav.appendChild(refr);
  var inst = document.createElement("button");
  inst.type = "button";
  inst.innerHTML = '<span class="ic">⬇️</span>App';
  nav.appendChild(inst);
  document.body.appendChild(nav);

  var fab = document.createElement("button");
  fab.id = "tydnavfab";
  fab.type = "button";
  document.body.appendChild(fab);
  function setNavOpen(open) {
    document.body.classList.toggle("tyd-nav-open", open);
    document.body.classList.toggle("tyd-nav-closed", !open);
    fab.innerHTML = open ? "⌄ Hide" : "🦆 Menu";
    try { localStorage.setItem("tydNavOpen", open ? "1" : "0"); } catch (e) {}
  }
  fab.addEventListener("click", function () {
    setNavOpen(!document.body.classList.contains("tyd-nav-open"));
  });
  var startOpen = false;
  try { startOpen = localStorage.getItem("tydNavOpen") === "1"; } catch (e) {}
  setNavOpen(startOpen);

  var overlay = document.createElement("div");
  overlay.id = "tydinstall";
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  overlay.innerHTML = '<div class="box"><h3>Put the Pond on your home screen 🦆</h3>'
    + (isIOS
      ? '<p>On iPhone or iPad: tap the <b>Share</b> button in Safari, then tap <b>Add to Home Screen</b>. The Pond gets its own duck icon, just like an app.</p>'
      : '<p>Tap your browser menu (the three dots or lines), then tap <b>Install app</b> or <b>Add to Home screen</b>. The Pond gets its own duck icon, just like an app.</p>')
    + '<button type="button">Got it</button></div>';
  document.body.appendChild(overlay);
  overlay.querySelector("button").addEventListener("click", function () { overlay.classList.remove("show"); });
  overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.classList.remove("show"); });

  var deferred = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });
  inst.addEventListener("click", function () {
    if (deferred) { deferred.prompt(); deferred = null; }
    else overlay.classList.add("show");
  });

  if ("serviceWorker" in navigator) {
    try { navigator.serviceWorker.register(base + "sw.js").catch(function () {}); } catch (e) {}
  }
})();
