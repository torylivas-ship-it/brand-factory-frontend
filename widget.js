/*
 * BFN Ops — Instant Reply chat widget.
 * Embed on any site:
 *   <script src="https://brand-factory-frontend.vercel.app/widget.js" data-bfn-key="wk_..." async></script>
 * Optional: data-color="#c9a24a" (accent), data-api="https://..." (API override), data-open="1".
 * Self-contained (no dependencies), rendered in a shadow root so the host
 * site's CSS can't break it and it can't break the host site.
 */
(function () {
  "use strict";
  var script = document.currentScript || document.querySelector("script[data-bfn-key]");
  if (!script || window.__bfnWidgetLoaded) return;
  window.__bfnWidgetLoaded = true;

  var KEY = script.getAttribute("data-bfn-key");
  if (!KEY) return;
  var API = (script.getAttribute("data-api") || "https://brand-factory-production-b27f.up.railway.app").replace(/\/$/, "");
  var ACCENT = script.getAttribute("data-color") || "#c9a24a";
  var STORE = "bfn_widget_" + KEY;

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || null; } catch (e) { return null; }
  }
  function save(state) {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }
  function newSession() {
    if (window.crypto && crypto.randomUUID) return "s-" + crypto.randomUUID();
    return "s-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }

  var state = load() || { session: newSession(), messages: [] };
  // Drop conversations older than 7 days so a returning visitor starts fresh.
  if (state.started && Date.now() - state.started > 7 * 864e5) state = { session: newSession(), messages: [] };
  state.started = state.started || Date.now();

  // data-fullpage="1": the hosted /chat page (for businesses with no website
  // — the link goes in an Instagram bio). Chat fills the screen, no bubble.
  var FULL = script.getAttribute("data-fullpage") === "1";
  var host = document.createElement("div");
  host.id = "bfn-widget";
  host.style.cssText = FULL ? "position:fixed;inset:0;z-index:2147483000;" : "position:fixed;z-index:2147483000;right:16px;bottom:16px;";
  var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

  root.innerHTML =
    "<style>" +
    ":host{all:initial}" +
    "*{box-sizing:border-box;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
    ".bubble{width:58px;height:58px;border-radius:50%;border:none;cursor:pointer;background:" + ACCENT + ";color:#111;" +
    "box-shadow:0 6px 24px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;transition:transform .15s}" +
    ".bubble:hover{transform:scale(1.06)}" +
    ".bubble svg{width:26px;height:26px}" +
    ".panel{position:absolute;right:0;bottom:72px;width:min(360px,calc(100vw - 32px));height:min(520px,calc(100vh - 110px));" +
    "background:#fff;color:#1b1b1f;border-radius:14px;box-shadow:0 12px 48px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden}" +
    ".panel.open{display:flex}" +
    ".head{background:#141217;color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between}" +
    ".head b{font-size:15px}.head small{display:block;font-size:12px;opacity:.7;margin-top:2px}" +
    ".x{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1;opacity:.8}" +
    ".log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:#f6f5f2}" +
    ".m{max-width:82%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.4;white-space:pre-wrap;word-wrap:break-word}" +
    ".m.in{align-self:flex-end;background:" + ACCENT + ";color:#111;border-bottom-right-radius:4px}" +
    ".m.out{align-self:flex-start;background:#fff;border:1px solid #e6e3dc;border-bottom-left-radius:4px}" +
    ".m a{color:inherit;font-weight:600}" +
    ".typing{align-self:flex-start;font-size:13px;color:#888;padding:4px 6px}" +
    ".book{margin:0 14px 10px;padding:9px;border-radius:8px;text-align:center;font-size:14px;font-weight:600;text-decoration:none;background:#141217;color:#fff;display:none}" +
    "form{display:flex;gap:8px;padding:10px;border-top:1px solid #eee;background:#fff}" +
    "input{flex:1;border:1px solid #ddd;border-radius:20px;padding:10px 14px;font-size:14px;outline:none;color:#1b1b1f;background:#fff}" +
    "input:focus{border-color:" + ACCENT + "}" +
    "button.send{border:none;border-radius:20px;padding:0 16px;background:#141217;color:#fff;font-weight:600;cursor:pointer;font-size:14px}" +
    "button.send:disabled{opacity:.5}" +
    ".foot{font-size:11px;color:#999;text-align:center;padding:0 0 8px;background:#fff}" +
    (FULL ? ".panel{position:absolute;inset:0;width:auto;height:auto;border-radius:0;display:flex;max-width:640px;margin:0 auto;box-shadow:none}" +
      ".bubble,.x{display:none}" : "") +
    "</style>" +
    "<div class='panel' role='dialog' aria-label='Chat'>" +
    "  <div class='head'><div><b class='name'>Chat with us</b><small>Usually replies instantly</small></div>" +
    "  <button class='x' aria-label='Close chat'>×</button></div>" +
    "  <div class='log' aria-live='polite'></div>" +
    "  <a class='book' target='_blank' rel='noopener'>Book now →</a>" +
    "  <form><input maxlength='1000' placeholder='Type your message…' aria-label='Message' />" +
    "  <button class='send' type='submit'>Send</button></form>" +
    "  <div class='foot'>Automated assistant · the owner sees every message</div>" +
    "</div>" +
    "<button class='bubble' aria-label='Open chat'><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>" +
    "<path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/></svg></button>";

  var panel = root.querySelector(".panel");
  var log = root.querySelector(".log");
  var form = root.querySelector("form");
  var input = root.querySelector("input");
  var sendBtn = root.querySelector(".send");
  var book = root.querySelector(".book");
  var greeting = null;

  function linkify(text) {
    var div = document.createElement("div");
    div.textContent = text;
    // innerHTML escapes < > & but not quotes — so quotes must never be part
    // of a matched URL, or it could break out of the href attribute.
    return div.innerHTML.replace(/(https?:\/\/[^\s<>'"]+)/g, function (url) {
      var clean = url.replace(/[.,!?)]+$/, "");
      return "<a href='" + clean + "' target='_blank' rel='noopener nofollow'>" + clean + "</a>" + url.slice(clean.length);
    });
  }

  function render() {
    log.innerHTML = "";
    if (greeting) append("out", greeting, false);
    state.messages.forEach(function (m) { append(m.d, m.t, false); });
    log.scrollTop = log.scrollHeight;
  }

  function append(direction, text, persist) {
    var el = document.createElement("div");
    el.className = "m " + direction;
    el.innerHTML = linkify(text);
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    if (persist) {
      state.messages.push({ d: direction, t: text });
      state.messages = state.messages.slice(-60);
      save(state);
    }
  }

  function toggle(open) {
    panel.classList.toggle("open", open);
    if (open) setTimeout(function () { input.focus(); }, 50);
  }

  root.querySelector(".bubble").addEventListener("click", function () { toggle(!panel.classList.contains("open")); });
  root.querySelector(".x").addEventListener("click", function () { toggle(false); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || sendBtn.disabled) return;
    input.value = "";
    append("in", text, true);
    sendBtn.disabled = true;
    var typing = document.createElement("div");
    typing.className = "typing";
    typing.textContent = "typing…";
    log.appendChild(typing);
    log.scrollTop = log.scrollHeight;

    fetch(API + "/wf/public/widget/" + encodeURIComponent(KEY) + "/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: state.session, message: text }),
    })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b }; }); })
      .then(function (res) {
        typing.remove();
        append("out", res.ok ? res.body.reply : "Sorry — something went wrong on our end. Please try again in a moment.", res.ok);
      })
      .catch(function () {
        typing.remove();
        append("out", "Looks like you're offline — try again in a moment.", false);
      })
      .then(function () { sendBtn.disabled = false; input.focus(); });
  });

  fetch(API + "/wf/public/widget/" + encodeURIComponent(KEY))
    .then(function (r) { if (!r.ok) throw new Error("widget not found"); return r.json(); })
    .then(function (cfg) {
      root.querySelector(".name").textContent = cfg.business_name;
      greeting = cfg.greeting;
      if (cfg.booking_url) { book.href = cfg.booking_url; book.style.display = "block"; }
      render();
      (document.body || document.documentElement).appendChild(host);
      if (script.getAttribute("data-open") === "1") toggle(true);
    })
    .catch(function () { /* Unknown/canceled key: render nothing on the host site. */ });
})();
