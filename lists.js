// TreatYourselfDiscounts personal deal lists.
// Visitors build their own lists of deals and coupon codes. Lists live on the
// device (localStorage) and sync to the visitor's Pond Account (Firestore
// users/{uid}.dealLists) when they are logged in, merged by union.
export var LS_KEY = "tydDealLists";
export var FIREBASE_CONFIG = {
  apiKey: "AIzaSyDoy5WjnhDlBqZaqZDUFkX6XodiXvQmr7I",
  authDomain: "treatyourselfdiscounts-881a9.firebaseapp.com",
  projectId: "treatyourselfdiscounts-881a9",
  storageBucket: "treatyourselfdiscounts-881a9.firebasestorage.app",
  messagingSenderId: "635205549581",
  appId: "1:635205549581:web:698e046036b14f33f81f44"
};

export function emptyLists() { return { "My List": [] }; }
export function loadLocal() {
  try {
    var v = JSON.parse(localStorage.getItem(LS_KEY));
    if (v && typeof v === "object" && !Array.isArray(v)) return v;
  } catch (e) {}
  return emptyLists();
}
export function saveLocal(lists) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(lists)); } catch (e) {}
}
export function itemId(it) { return (it.href || "") + "|" + (it.title || "") + "|" + (it.code || ""); }
export function mergeLists(a, b) {
  var out = {};
  [a || {}, b || {}].forEach(function (src) {
    Object.keys(src).forEach(function (name) {
      if (!out[name]) out[name] = [];
      (src[name] || []).forEach(function (it) {
        var id = itemId(it);
        if (!out[name].some(function (x) { return itemId(x) === id; })) out[name].push(it);
      });
    });
  });
  if (!Object.keys(out).length) return emptyLists();
  return out;
}
export function countItems(lists) {
  return Object.keys(lists || {}).reduce(function (n, k) { return n + (lists[k] || []).length; }, 0);
}

var state = { lists: null, uid: null, db: null, fs: null, listeners: [] };
function getLists() {
  if (!state.lists) state.lists = loadLocal();
  return state.lists;
}
function emit() {
  saveLocal(getLists());
  state.listeners.forEach(function (cb) { try { cb(getLists()); } catch (e) {} });
  if (typeof document !== "undefined") {
    document.dispatchEvent(new CustomEvent("tyd-lists-changed", { detail: getLists() }));
    updatePill();
  }
  pushRemote();
}
var pushTimer = null;
function pushRemote() {
  if (!state.uid || !state.db || !state.fs) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(function () {
    state.fs.setDoc(state.fs.doc(state.db, "users", state.uid), { dealLists: getLists() }, { merge: true }).catch(function () {});
  }, 400);
}
export function addItem(listName, item) {
  var lists = getLists();
  var name = (listName || "My List").trim() || "My List";
  if (!lists[name]) lists[name] = [];
  var id = itemId(item);
  if (!lists[name].some(function (x) { return itemId(x) === id; })) {
    lists[name].push(item);
  }
  emit();
  return name;
}
export function removeItem(listName, id) {
  var lists = getLists();
  if (lists[listName]) lists[listName] = lists[listName].filter(function (x) { return itemId(x) !== id; });
  emit();
}
export function createList(name) {
  var lists = getLists();
  var n = (name || "").trim();
  if (n && !lists[n]) { lists[n] = []; emit(); }
  return n;
}
export function deleteList(name) {
  var lists = getLists();
  if (lists[name]) { delete lists[name]; emit(); }
}
export function onListsChange(cb) { state.listeners.push(cb); }

async function initSync() {
  try {
    var appMod = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
    var authMod = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
    var fsMod = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
    var app = appMod.getApps().length ? appMod.getApps()[0] : appMod.initializeApp(FIREBASE_CONFIG);
    var auth = authMod.getAuth(app);
    var db = fsMod.getFirestore(app);
    state.db = db; state.fs = fsMod;
    authMod.onAuthStateChanged(auth, async function (user) {
      var note = typeof document !== "undefined" ? document.getElementById("sync-note") : null;
      if (user) {
        state.uid = user.uid;
        try {
          var snap = await fsMod.getDoc(fsMod.doc(db, "users", user.uid));
          var remote = (snap.exists() && snap.data().dealLists) || {};
          state.lists = mergeLists(getLists(), remote);
          emit();
        } catch (e) {}
        if (note) note.textContent = "Your lists are synced to your Pond account, so they follow you across your devices.";
      } else {
        state.uid = null;
        if (note) note.textContent = "Your lists are saved on this device. Log in with your free Pond Account and they will sync across your devices.";
      }
    });
  } catch (e) {}
}

/* ---------- injected styles ---------- */
var CSS = [
  ".tyd-add { margin-left:auto; flex-shrink:0; background:#ffd94d; color:#6b5900; font-weight:800; font-size:12.5px; border-radius:999px; padding:7px 12px; cursor:pointer; border:2px solid #f0c93e; font-family:inherit; white-space:nowrap; }",
  ".tyd-add:active { transform:scale(.96); }",
  ".card .tyd-add { display:inline-block; margin:8px 0 2px; }",
  ".tyd-pill { position:fixed; right:14px; bottom:14px; z-index:60; background:#1f5f74; color:#fff; font-weight:800; font-size:14px; text-decoration:none; border-radius:999px; padding:12px 18px; box-shadow:0 6px 18px rgba(35,65,77,.35); font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }",
  ".tyd-pop { position:fixed; left:50%; bottom:18px; transform:translateX(-50%); z-index:70; background:#fff; border-radius:18px; box-shadow:0 12px 32px rgba(35,65,77,.35); padding:16px; width:min(92vw,360px); font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#23414d; }",
  ".tyd-pop h3 { margin:0 0 8px; font-size:16px; color:#1f5f74; }",
  ".tyd-pop .lpick { display:block; width:100%; text-align:left; background:#eaf7fb; border:none; border-radius:12px; padding:10px 12px; font-weight:700; font-size:14px; color:#1f5f74; cursor:pointer; margin:0 0 6px; font-family:inherit; }",
  ".tyd-pop .lrow { display:flex; gap:6px; margin-top:8px; }",
  ".tyd-pop input { flex:1; border:2px solid #bcd9e4; border-radius:12px; padding:9px 10px; font-size:14px; font-family:inherit; min-width:0; }",
  ".tyd-pop .lnew { background:#ffd94d; color:#6b5900; border:2px solid #f0c93e; font-weight:800; border-radius:999px; padding:9px 13px; cursor:pointer; font-family:inherit; }",
  ".tyd-pop .lcancel { display:block; margin:10px auto 0; background:none; border:none; color:#5b7d89; font-weight:700; cursor:pointer; font-family:inherit; font-size:13.5px; }",
  ".tyd-toast { position:fixed; left:50%; bottom:84px; transform:translateX(-50%) translateY(20px); z-index:80; background:#23414d; color:#fff; font-weight:700; font-size:14px; padding:10px 16px; border-radius:999px; opacity:0; pointer-events:none; transition:all .3s ease; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; max-width:92vw; text-align:center; }",
  ".tyd-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }"
].join("\n");

function inBrands() { return window.location.pathname.indexOf("/brands/") !== -1; }
function listsUrl() { return (inBrands() ? "../" : "") + "my-lists.html"; }

var pillEl = null;
function updatePill() {
  if (!pillEl) return;
  var n = countItems(getLists());
  pillEl.textContent = "🧺 My Lists" + (n ? " (" + n + ")" : "");
}
function toast(msg) {
  var t = document.querySelector(".tyd-toast");
  if (!t) { t = document.createElement("div"); t.className = "tyd-toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(function () { t.classList.remove("show"); }, 2000);
}
function closePop() { var p = document.querySelector(".tyd-pop"); if (p) p.remove(); }
function openPicker(item) {
  closePop();
  var pop = document.createElement("div");
  pop.className = "tyd-pop";
  var names = Object.keys(getLists());
  var html = "<h3>Save to which list?</h3>";
  names.forEach(function (n) { html += '<button class="lpick" data-list="' + n.replace(/"/g, "&quot;") + '">🧺 ' + n.replace(/</g, "&lt;") + " (" + getLists()[n].length + ")</button>"; });
  html += '<div class="lrow"><input type="text" placeholder="New list name, like Gift ideas"><button class="lnew">Create + save</button></div>';
  html += '<button class="lcancel">Cancel</button>';
  pop.innerHTML = html;
  document.body.appendChild(pop);
  pop.querySelectorAll(".lpick").forEach(function (b) {
    b.addEventListener("click", function () {
      addItem(b.getAttribute("data-list"), item);
      closePop();
      toast("Saved to " + b.getAttribute("data-list") + " 🧺");
    });
  });
  pop.querySelector(".lnew").addEventListener("click", function () {
    var v = pop.querySelector("input").value.trim();
    if (!v) { pop.querySelector("input").focus(); return; }
    addItem(v, item);
    closePop();
    toast("Saved to your new list, " + v + " 🧺");
  });
  pop.querySelector(".lcancel").addEventListener("click", closePop);
}
function snapshotFromDeal(a) {
  var nameEl = a.querySelector(".name");
  var offerEl = a.querySelector(".offer");
  var img = a.querySelector("img");
  var h1 = document.querySelector("h1");
  return {
    kind: "deal",
    brand: h1 ? h1.textContent.trim() : "TreatYourselfDiscounts",
    title: nameEl ? nameEl.textContent.trim() : a.textContent.trim().slice(0, 60),
    note: offerEl ? offerEl.textContent.trim() : "",
    code: "",
    href: a.href,
    img: img ? img.src : ""
  };
}
function snapshotFromCard(card) {
  var nameEl = card.querySelector(".name");
  var offerEl = card.querySelector(".offer");
  var chip = card.querySelector(".chip");
  var img = card.querySelector("img");
  var code = "";
  if (chip) { var m = chip.textContent.match(/Code:\s*(.+)/); if (m) code = m[1].trim(); }
  return {
    kind: code ? "coupon" : "deal",
    brand: nameEl ? nameEl.textContent.trim() : "TreatYourselfDiscounts",
    title: nameEl ? nameEl.textContent.trim() : "Deal",
    note: offerEl ? offerEl.textContent.trim() : "",
    code: code,
    href: card.href,
    img: img ? img.src : ""
  };
}
function wireButtons() {
  document.querySelectorAll("a.deal").forEach(function (a) {
    if (a.querySelector(".tyd-add")) return;
    var b = document.createElement("span");
    b.className = "tyd-add"; b.setAttribute("role", "button"); b.tabIndex = 0;
    b.textContent = "＋ Add to list";
    b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); openPicker(snapshotFromDeal(a)); });
    a.appendChild(b);
  });
  document.querySelectorAll("a.card").forEach(function (card) {
    var href = card.getAttribute("href") || "";
    if (!(href.indexOf("http") === 0 || href.indexOf("brands/") !== -1)) return;
    if (card.querySelector(".tyd-add")) return;
    var info = card.querySelector(".info") || card;
    var b = document.createElement("span");
    b.className = "tyd-add"; b.setAttribute("role", "button"); b.tabIndex = 0;
    b.textContent = "＋ Save to list";
    b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); openPicker(snapshotFromCard(card)); });
    info.appendChild(document.createElement("br"));
    info.appendChild(b);
  });
}
function init() {
  var st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);
  pillEl = document.createElement("a");
  pillEl.className = "tyd-pill";
  pillEl.href = listsUrl();
  document.body.appendChild(pillEl);
  updatePill();
  wireButtons();
  initSync();
  document.dispatchEvent(new CustomEvent("tyd-lists-ready", { detail: getLists() }));
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  window.TYDLists = {
    getLists: getLists, addItem: addItem, removeItem: removeItem,
    createList: createList, deleteList: deleteList, onListsChange: onListsChange,
    itemId: itemId, countItems: countItems
  };
  window.TYDOpenSave = openPicker;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}
