/* Runs in <head> before first paint so the saved theme never flashes.
   Dark is the default; "light" only when the visitor picked it. */
(function(){
  var d = document.documentElement, t = null;
  try{ t = localStorage.getItem('theme'); }catch(e){}
  d.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  d.className += ' js';
})();
