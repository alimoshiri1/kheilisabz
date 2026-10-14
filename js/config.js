/* On GitHub Pages there is no json-server, so the site works in STATIC mode
   by reading db.json directly. Locally (localhost) it still uses the API. */
(function () {
  var isStatic = /(^|\.)github\.io$/.test(location.hostname) || location.protocol === "file:" || !!window.__STATIC__;
  // allow forced static with ?static=1 for testing
  try {
    if (/(?:\?|&)static=1/.test(location.search)) isStatic = true;
  } catch (e) {}
  window.CONFIG = {
    API: isStatic ? "" : "http://127.0.0.1:3000",
    STATIC: isStatic,
    STATIC_DB: "db.json",
    SITE: "https://kheilisabz.com",
  };
})();
