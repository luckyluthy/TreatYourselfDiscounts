/* Today's Top Deals: gathers the live deal rows from every brand page and
   spotlights the strongest savings on the home page. Because it reads the
   brand pages at visit time, it can never drift out of sync with them:
   when the daily deal check updates a brand page, this section follows. */
(function () {
  var grid = document.getElementById("tdgrid");
  if (!grid) return;
  function txt(el) { return el ? el.textContent.trim() : ""; }
  var cards = Array.prototype.slice.call(document.querySelectorAll('a.card[href^="brands/"]'));
  var jobs = cards.map(function (card) {
    var url = card.getAttribute("href");
    var brand = txt(card.querySelector(".name"));
    return fetch(url).then(function (r) { return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var out = [];
      doc.querySelectorAll("a.deal").forEach(function (d) {
        var name = txt(d.querySelector(".name"));
        var offer = txt(d.querySelector(".offer"));
        var img = d.querySelector("img.thumb");
        var pct = 0;
        var m = offer.match(/\$([\d.]+)\s*\(was \$([\d.]+)/);
        if (m) { var now = parseFloat(m[1]), was = parseFloat(m[2]); if (was > now) pct = Math.round((1 - now / was) * 100); }
        else { var pm = offer.match(/(\d+)%\s*(off|OFF)/); if (pm) pct = parseInt(pm[1], 10); }
        out.push({ brand: brand, name: name, offer: offer, href: d.getAttribute("href"), img: img ? img.getAttribute("src") : "", pct: pct, page: url });
      });
      return out;
    }).catch(function () { return []; });
  });
  Promise.all(jobs).then(function (all) {
    var deals = [];
    all.forEach(function (list) { deals = deals.concat(list); });
    deals.sort(function (a, b) { return b.pct - a.pct; });
    deals = deals.slice(0, 8);
    if (!deals.length) {
      grid.innerHTML = '<p class="td-load">No spotlight deals at this exact moment. Browse the brands below for the latest offers.</p>';
      return;
    }
    grid.innerHTML = "";
    deals.forEach(function (d) {
      var el = document.createElement("div");
      el.className = "tdcard";
      var top = document.createElement("a");
      top.href = d.href; top.target = "_blank"; top.rel = "noopener";
      top.style.textDecoration = "none"; top.style.color = "inherit";
      if (d.img) {
        var im = document.createElement("img");
        im.src = d.img; im.alt = ""; im.loading = "lazy";
        im.onerror = function () { this.remove(); };
        top.appendChild(im);
      }
      var b = document.createElement("div"); b.className = "tdbrand"; b.textContent = d.brand; top.appendChild(b);
      var n = document.createElement("div"); n.className = "tdname"; n.textContent = d.name; top.appendChild(n);
      var o = document.createElement("div"); o.className = "tdoffer"; o.textContent = d.offer; top.appendChild(o);
      el.appendChild(top);
      var row = document.createElement("div");
      row.style.display = "flex"; row.style.gap = "6px"; row.style.flexWrap = "wrap";
      var sv = document.createElement("button");
      sv.className = "tdsave"; sv.type = "button"; sv.textContent = "＋ Save to list";
      sv.addEventListener("click", function () {
        if (window.TYDOpenSave) window.TYDOpenSave({ href: d.href, name: d.brand + " — " + d.name, offer: d.offer, img: d.img || "" });
      });
      var pg = document.createElement("a");
      pg.href = d.page; pg.className = "tdsave"; pg.style.textDecoration = "none"; pg.textContent = "Brand page ›";
      row.appendChild(sv); row.appendChild(pg);
      el.appendChild(row);
      grid.appendChild(el);
    });
  });
})();
