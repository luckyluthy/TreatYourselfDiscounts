// Shared Pond Account pill: shows the visitor's real login state on every
// page. Logged out it invites log in / sign up; logged in it shows their
// email and links to their account. Firebase Auth keeps the session across
// the whole site, so this pill just makes that visible everywhere.
(function () {
  function inBrands() { return window.location.pathname.indexOf("/brands/") !== -1; }
  function accountUrl() { return (inBrands() ? "../" : "") + "account.html"; }
  function ensurePill() {
    var pill = document.getElementById("acctpill");
    if (pill) return pill;
    pill = document.createElement("a");
    pill.id = "acctpill";
    pill.href = accountUrl();
    pill.style.cssText = "display:inline-block; background:#1f5f74; color:#fff; font-weight:800; font-size:13px; text-decoration:none; border-radius:999px; padding:8px 15px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;";
    pill.textContent = "🦆 Pond Account · Log in / Sign up";
    var holder = document.createElement("div");
    holder.style.cssText = "text-align:right; margin:8px 0;";
    holder.appendChild(pill);
    var host = document.querySelector(".app") || document.querySelector(".wrap") || document.body;
    host.insertBefore(holder, host.firstChild);
    return pill;
  }
  async function init() {
    var pill = ensurePill();
    try {
      var appMod = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
      var authMod = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
      var config = {
        apiKey: "AIzaSyDoy5WjnhDlBqZaqZDUFkX6XodiXvQmr7I",
        authDomain: "treatyourselfdiscounts-881a9.firebaseapp.com",
        projectId: "treatyourselfdiscounts-881a9",
        storageBucket: "treatyourselfdiscounts-881a9.firebasestorage.app",
        messagingSenderId: "635205549581",
        appId: "1:635205549581:web:698e046036b14f33f81f44"
      };
      var app = appMod.getApps().length ? appMod.getApps()[0] : appMod.initializeApp(config);
      authMod.onAuthStateChanged(authMod.getAuth(app), function (user) {
        pill.textContent = user ? "🦆 " + user.email + " · My Account" : "🦆 Pond Account · Log in / Sign up";
      });
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
