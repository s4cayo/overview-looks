/* Joins the separate redesign mockups into one clickable app on the local server.
   Added to every page by serve.py; the page files themselves are not changed. */
(function () {
  // Where the site root is: "/" on the local server, "/overview-looks/app/" on GitHub Pages.
  var me = document.currentScript && document.currentScript.src;
  var BASE = me ? new window.URL(me).pathname.replace(/local\/glue\.js$/, "") : "/";
  var URL = {
    overview: BASE + "previews/N-final.html",
    orders: BASE + "pages/orders-shipping/orders-B.html",
    shipping: BASE + "pages/orders-shipping/shipping-B.html",
    products: BASE + "pages/inventory-products/products-A.html",
    inventory: BASE + "pages/inventory-products/inventory-A.html",
    assistant: BASE + "pages/assistant/G-gemini.html"
  };
  var LABEL = { overview: "overview", home: "overview", orders: "orders", shipping: "shipping",
    products: "products", inventory: "inventory", assistant: "assistant", tricky: "assistant", "ask ai": "assistant", "ask tricky": "assistant" };
  // data-*-go keys used by the pages (Orders pages call Orders "sales" and Shipping "orders").
  var KEY = { overview: "overview", sales: "orders", orders: "shipping", products: "products",
    inventory: "inventory", assistant: "assistant" };
  var SOON = /^(all brands|meta ads|ads manager|ads report|ads|competitors|connections|settings|admin|workspace|brands|adsmanager|elsewhere)$/;

  var here = Object.keys(URL).find(function (k) { return location.pathname === URL[k]; });

  function label(el) {
    var t = (el.innerText || el.getAttribute("aria-label") || "").trim().split("\n").pop().trim().toLowerCase();
    return t;
  }
  function toast(msg) {
    var t = document.getElementById("glue-toast");
    if (!t) {
      t = document.createElement("div"); t.id = "glue-toast"; t.setAttribute("role", "status");
      t.style.cssText = "position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:9999;padding:10px 16px;border-radius:12px;" +
        "font:500 14px/1.4 'Inter Tight',system-ui,sans-serif;background:#1a1426;color:#f2eff8;box-shadow:0 12px 30px -10px rgba(0,0,0,.5);" +
        "transition:opacity .2s;opacity:0;pointer-events:none;max-width:calc(100vw - 32px);text-align:center";
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = "1";
    clearTimeout(t._h); t._h = setTimeout(function () { t.style.opacity = "0"; }, 2200);
  }
  function go(page, e) {
    if (!page) return false;
    if (page === here) return false; // let the page handle its own item
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    try { localStorage.setItem("fnw-glue-theme", document.documentElement.getAttribute("data-theme") || ""); } catch (x) {}
    location.href = URL[page];
    return true;
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("a,button");
    if (!el || el.closest("#glue-toast")) return;
    if (el.hasAttribute("aria-expanded") && el.classList.contains("nv2-mr")) return; // menu group headers just expand

    var inSide = el.closest("aside#side");
    var inDock = el.closest(".nv2-dock");
    var inMenu = el.closest(".nv2-menu, .nv2-sheet");

    // The purple AI button and "Ask AI" go to the Assistant page.
    if ((el.matches(".nv2-ai, [data-nv2-open=ai]") || (inMenu && label(el) === "ask ai")) && here !== "assistant") {
      go("assistant", e); return;
    }
    // Sidebar, phone bar and full-screen menu.
    if (inSide || inDock || inMenu) {
      var k = el.getAttribute("data-nv2-go") || el.getAttribute("data-go") || el.getAttribute("data-ip-go");
      var page = (k && KEY[k]) || LABEL[label(el)];
      if (page) { go(page, e); return; }
      if ((k && SOON.test(k)) || SOON.test(label(el))) {
        if (inSide || inDock || inMenu) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); toast("This page isn't redesigned yet."); }
      }
      return;
    }
    // In-page links between Products and Inventory.
    var ip = el.getAttribute("data-ip-go");
    if (ip && KEY[ip]) { go(KEY[ip], e); return; }
    // Overview round buttons: Orders and Shipping open their own pages.
    var qa = el.getAttribute("data-qa1");
    if (qa === "orders") { go("orders", e); return; }
    if (qa === "shipping") { go("shipping", e); return; }
  }, true);

  // Keep light/dark the same when moving between pages.
  try {
    var th = localStorage.getItem("fnw-glue-theme");
    if (th) {
      var apply = function () {
        if (document.documentElement.getAttribute("data-theme") !== th) document.documentElement.setAttribute("data-theme", th);
      };
      apply(); addEventListener("DOMContentLoaded", apply); addEventListener("load", function () { setTimeout(apply, 50); });
    }
  } catch (x) {}
  // Remember a theme switch made on this page too.
  new MutationObserver(function () {
    try { localStorage.setItem("fnw-glue-theme", document.documentElement.getAttribute("data-theme") || ""); } catch (x) {}
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();
