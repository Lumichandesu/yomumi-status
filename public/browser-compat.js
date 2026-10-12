/* Keep this classic script ES3-compatible. It runs before the status module. */
(function () {
  var script = document.createElement('script');
  var element = document.createElement('div');
  if (typeof window.fetch !== 'function' || typeof window.Promise !== 'function' ||
      typeof window.URL !== 'function' || typeof window.AbortController !== 'function' ||
      typeof element.replaceChildren !== 'function' || typeof element.append !== 'function' ||
      !window.Intl || typeof window.Intl.DateTimeFormat !== 'function' ||
      typeof window.Intl.NumberFormat !== 'function' ||
      !('noModule' in script)) {
    window.location.replace('./unsupported/');
  }
}());
