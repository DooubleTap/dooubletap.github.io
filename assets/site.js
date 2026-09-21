/* ===========================================================================
   dooubletap.github.io — site script. No dependencies, no network requests.
   Stores two settings in localStorage (lang, theme) and one flag (notice).
   =========================================================================== */
(function(){
'use strict';

var root = document.documentElement;
var BASE = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
var store = {
  get: function(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set: function(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
};
function $(s, c){ return (c || document).querySelector(s); }
function $$(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function icon(name){ return '<svg class="i" aria-hidden="true"><use href="' + BASE + 'icons.svg#i-' + name + '"></use></svg>'; }
function lang(){ return root.lang === 'en' ? 'en' : 'fr'; }
function t(fr, en){ return lang() === 'en' ? en : fr; }

/* ---------- language ----------
   The markup is written in French (the default). Elements carry their English in
   data-en; the French is copied to data-fr the first time we switch away. */
function setLang(l){
  root.lang = l;
  $$('[data-en]').forEach(function(el){
    if(!el.hasAttribute('data-fr')) el.setAttribute('data-fr', el.innerHTML);
    el.innerHTML = el.getAttribute('data-' + l);
  });
  $$('[data-en-label]').forEach(function(el){
    if(!el.hasAttribute('data-fr-label')) el.setAttribute('data-fr-label', el.getAttribute('aria-label') || '');
    el.setAttribute('aria-label', el.getAttribute('data-' + l + '-label'));
  });
  $$('[data-en-ph]').forEach(function(el){
    if(!el.hasAttribute('data-fr-ph')) el.setAttribute('data-fr-ph', el.getAttribute('placeholder') || '');
    el.setAttribute('placeholder', el.getAttribute('data-' + l + '-ph'));
  });
  $$('article[data-lang]').forEach(function(a){ a.hidden = a.getAttribute('data-lang') !== l; });
  $$('.lang button').forEach(function(b){
    var on = b.getAttribute('data-set-lang') === l;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  store.set('lang', l);
  document.dispatchEvent(new CustomEvent('langchange'));
}
$$('.lang button').forEach(function(b){
  b.addEventListener('click', function(){ setLang(b.getAttribute('data-set-lang')); });
});

/* ---------- theme ---------- */
var sw = $('#theme-switch');
function syncTheme(){
  var dark = root.getAttribute('data-theme') !== 'light';
  if(sw) sw.setAttribute('aria-checked', dark ? 'true' : 'false');
  var m = $('meta[name=theme-color]');
  if(m) m.setAttribute('content', dark ? '#06080c' : '#f4f6f9');
}
if(sw) sw.addEventListener('click', function(){
  var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  store.set('theme', next);
  syncTheme();
});
syncTheme();

/* ---------- mobile menu ---------- */
var mb = $('#menu-btn'), nav = $('#navlinks');
if(mb && nav){
  mb.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('a', nav).forEach(function(a){ a.addEventListener('click', function(){
    nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false');
  }); });
}

/* ---------- privacy notice (information only) ---------- */
var notice = $('#notice');
if(notice && !store.get('notice-ok')){
  notice.hidden = false;
  $('button', notice).addEventListener('click', function(){ notice.hidden = true; store.set('notice-ok', '1'); });
}

/* ---------- reveal + active nav ---------- */
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
if('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {rootMargin:'0px 0px -8% 0px'});
  $$('.reveal').forEach(function(el){ io.observe(el); });
  var links = $$('nav.links a[href^="#"]');
  var spy = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  links.forEach(function(a){ var s = $(a.getAttribute('href')); if(s) spy.observe(s); });
}else{
  $$('.reveal').forEach(function(el){ el.classList.add('in'); });
}

/* ---------- hero: rotating role line ---------- */
var typed = $('#typed');
if(typed){
  var roles = {
    fr:['scripts FiveM & RedM', 'bots Discord', 'scripts IRC & eggdrop', 'sites web bilingues', 'code avec Claude Code'],
    en:['FiveM & RedM scripts', 'Discord bots', 'IRC & eggdrop scripts', 'bilingual websites', 'code with Claude Code']
  };
  var ri = 0, ci = 0, del = false, timer;
  var tick = function(){
    var list = roles[lang()], word = list[ri % list.length];
    ci += del ? -1 : 1;
    typed.textContent = word.slice(0, ci);
    var wait = del ? 35 : 70;
    if(!del && ci === word.length){ del = true; wait = 1800; }
    else if(del && ci === 0){ del = false; ri++; wait = 350; }
    timer = setTimeout(tick, wait);
  };
  if(reduce){
    typed.textContent = roles[lang()][0];
    document.addEventListener('langchange', function(){ typed.textContent = roles[lang()][0]; });
  }else{
    tick();
    document.addEventListener('langchange', function(){ clearTimeout(timer); ci = 0; del = false; tick(); });
  }
}

/* ---------- Claude Code terminal replay ---------- */
var term = $('#term-body');
if(term){
  var script = {
    fr:[
      ['<span class="pr">$</span> <span class="usr">claude</span>', 500],
      ['<span class="dim">╭ Claude Code · ~/Github/dooubletap.github.io</span>', 350],
      ['<span class="pr">&gt;</span> <span class="usr">refais mon portfolio : néon orange/vert/bleu, FR/EN,\n  mode clair, pis rends-le légal au Québec (Loi 25)</span>', 1100],
      ['<span class="tool">● Read</span> index.html, ../pisg.github.io/assets/site.css', 450],
      ['<span class="tool">● Read</span> ../undernet-canada/privacy.html', 350],
      ['<span class="tool">● Fetch</span> api.github.com/users/DooubleTap <span class="dim">→ 134 dépôts</span>', 600],
      ['<span class="hl">? </span>Données GitHub en direct ou instantané ? <span class="ok">instantané</span>', 800],
      ['<span class="tool">● Write</span> tools/update-github.py, assets/icons.svg', 450],
      ['<span class="tool">● Write</span> index.html, assets/site.css, assets/site.js', 450],
      ['<span class="tool">● Write</span> privacy/, terms/, cookies/ <span class="dim">(FR + EN)</span>', 500],
      ['<span class="tool">● Bash</span> vérif. contraste AA · 0 requête externe', 700],
      ['<span class="ok">✓</span> Prêt. On regarde le diff ensemble ?', 400]
    ],
    en:[
      ['<span class="pr">$</span> <span class="usr">claude</span>', 500],
      ['<span class="dim">╭ Claude Code · ~/Github/dooubletap.github.io</span>', 350],
      ['<span class="pr">&gt;</span> <span class="usr">rework my portfolio: orange/green/blue neon, FR/EN,\n  light mode, and make it legal in Quebec (Law 25)</span>', 1100],
      ['<span class="tool">● Read</span> index.html, ../pisg.github.io/assets/site.css', 450],
      ['<span class="tool">● Read</span> ../undernet-canada/privacy.html', 350],
      ['<span class="tool">● Fetch</span> api.github.com/users/DooubleTap <span class="dim">→ 134 repos</span>', 600],
      ['<span class="hl">? </span>Live GitHub data or a snapshot? <span class="ok">snapshot</span>', 800],
      ['<span class="tool">● Write</span> tools/update-github.py, assets/icons.svg', 450],
      ['<span class="tool">● Write</span> index.html, assets/site.css, assets/site.js', 450],
      ['<span class="tool">● Write</span> privacy/, terms/, cookies/ <span class="dim">(FR + EN)</span>', 500],
      ['<span class="tool">● Bash</span> AA contrast check · 0 external requests', 700],
      ['<span class="ok">✓</span> Done. Want to review the diff together?', 400]
    ]
  };
  var run = 0;
  var play = function(){
    var id = ++run, lines = script[lang()], i = 0, html = '';
    if(reduce){
      term.innerHTML = lines.map(function(l){ return l[0]; }).join('\n') + '\n<span class="pr">&gt;</span> <span class="caret"></span>';
      return;
    }
    var step = function(){
      if(id !== run) return;
      if(i >= lines.length){
        term.innerHTML = html + '<span class="pr">&gt;</span> <span class="caret"></span>';
        setTimeout(function(){ if(id === run) play(); }, 7000);
        return;
      }
      html += lines[i][0] + '\n';
      term.innerHTML = html + '<span class="caret"></span>';
      setTimeout(step, lines[i][1]);
      i++;
    };
    step();
  };
  var started = false;
  var start = function(){ if(!started){ started = true; play(); } };
  if('IntersectionObserver' in window){
    var tio = new IntersectionObserver(function(es){ if(es[0].isIntersecting){ start(); tio.disconnect(); } }, {threshold:.3});
    tio.observe(term);
  }else start();
  document.addEventListener('langchange', function(){ if(started) play(); });
}

/* ---------- GitHub snapshot ---------- */
var GH = window.GH_DATA;
var LANGS = {
  'Lua':['o','lua'], 'Tcl':['b','tcl'], 'mIRC Script':['b','mirc'], 'HTML':['g','html5'],
  'CSS':['g','css'], 'SCSS':['g','css'], 'JavaScript':['g','javascript'], 'TypeScript':['g','typescript'],
  'PHP':['g','code'], 'C':['b','code'], 'C++':['b','code'], 'C#':['b','code'], 'Batchfile':['b','windows'],
  'Perl':['b','perl'], 'Shell':['b','gnubash'], 'Python':['b','code'], 'Ruby':['b','code']
};
function lc(l){ return (LANGS[l] || ['',''])[0]; }
function li(l){ return (LANGS[l] || ['','code'])[1]; }
function cvar(g){ return g ? 'var(--' + {o:'orange', g:'green', b:'blue'}[g] + ')' : 'var(--faint)'; }

if(GH){
  var repos = GH.repos, own = repos.filter(function(r){ return !r.fork; });
  // Languages that make up at least 20% of an own repo (or its primary language).
  var repoLangs = function(r){
    var L = r.langs, tot = 0, out = [];
    if(L){ for(var k in L) tot += L[k]; for(var k2 in L) if(L[k2] / tot >= .2) out.push(k2); }
    if(!out.length && r.lang) out.push(r.lang);
    return out;
  };
  var langCount = {};
  own.forEach(function(r){ repoLangs(r).forEach(function(l){ langCount[l] = (langCount[l] || 0) + 1; }); });
  var stars = repos.reduce(function(s, r){ return s + r.stars; }, 0);

  var fill = function(){
    var vals = {
      public_repos: GH.user.public_repos, own: own.length, forks: repos.length - own.length,
      stars: stars, followers: GH.user.followers, since: GH.user.created.slice(0, 4)
    };
    $$('[data-gh]').forEach(function(el){ el.textContent = vals[el.getAttribute('data-gh')]; });
    $$('[data-gh-date]').forEach(function(el){
      el.textContent = new Date(GH.generated + 'T12:00:00').toLocaleDateString(lang() === 'en' ? 'en-CA' : 'fr-CA', {year:'numeric', month:'long', day:'numeric'});
    });
    // stack tiles: repo count for tiles tied to a GitHub language
    $$('.tile[data-lang]').forEach(function(tile){
      var n = langCount[tile.getAttribute('data-lang')] || 0, sm = $('small', tile);
      if(sm && n) sm.textContent = n + ' ' + t(n > 1 ? 'dépôts' : 'dépôt', n > 1 ? 'repos' : 'repo');
    });
  };

  // language bars
  var bars = $('#lang-bars');
  var drawBars = function(){
    if(!bars) return;
    var list = Object.keys(langCount).map(function(k){ return [k, langCount[k]]; })
      .sort(function(a, b){ return b[1] - a[1]; }).slice(0, 8);
    var max = list.length ? list[0][1] : 1;
    bars.innerHTML = list.map(function(p){
      return '<li style="--c:' + cvar(lc(p[0])) + '"><span class="name">' + icon(li(p[0])) + esc(p[0]) + '</span>' +
        '<span class="track" role="presentation"><span class="fill" data-w="' + (p[1] / max * 100).toFixed(1) + '"></span></span>' +
        '<span class="n">' + p[1] + '</span></li>';
    }).join('');
    bars.setAttribute('aria-label', list.map(function(p){ return p[0] + ': ' + p[1]; }).join(', '));
  };

  // repos created per year
  var years = $('#years'), ylabels = $('#year-labels');
  var drawYears = function(){
    if(!years) return;
    var first = 9999, last = new Date(GH.generated).getFullYear(), by = {};
    repos.forEach(function(r){
      var y = +r.created.slice(0, 4); if(y < first) first = y;
      by[y] = by[y] || {own:0, fork:0}; by[y][r.fork ? 'fork' : 'own']++;
    });
    var max = 0, y;
    for(y = first; y <= last; y++){ var b = by[y] || {own:0, fork:0}; max = Math.max(max, b.own + b.fork); }
    var cols = '', labs = '', desc = [];
    for(y = first; y <= last; y++){
      var c = by[y] || {own:0, fork:0}, tot = c.own + c.fork;
      desc.push(y + ': ' + c.own + ' / ' + c.fork);
      cols += '<div class="year" title="' + y + ' — ' + c.own + ' ' + t('perso', 'own') + ', ' + c.fork + ' forks">' +
        '<span class="tot" data-h="' + (tot / max * 100) + '">' + (tot || '') + '</span>' +
        '<span class="seg fork" data-h="' + (c.fork / max * 100) + '"></span>' +
        '<span class="seg own" data-h="' + (c.own / max * 100) + '"></span></div>';
      labs += '<span>' + String(y).slice(2) + '</span>';
    }
    years.innerHTML = cols; ylabels.innerHTML = labs.replace(/<span>(\d\d)<\/span>/, function(m, d){ return '<span>’' + d + '</span>'; });
    years.setAttribute('aria-label', t('Nouveaux dépôts par année (perso / forks) : ', 'New repositories per year (own / forks): ') + desc.join(', '));
  };

  var animateCharts = function(){
    $$('#lang-bars .fill').forEach(function(f){ f.style.width = f.getAttribute('data-w') + '%'; });
    $$('#years .seg').forEach(function(s){ s.style.height = s.getAttribute('data-h') + '%'; });
    $$('#years .tot').forEach(function(s){ s.style.bottom = s.getAttribute('data-h') + '%'; });
  };

  // repo explorer
  var list = $('#repo-list'), q = $('#repo-q'), sel = $('#repo-lang'), more = $('#repo-more'), count = $('#repo-count');
  var type = 'all', shown = 12;
  var drawRepos = function(){
    if(!list) return;
    var term = (q.value || '').trim().toLowerCase(), lf = sel.value;
    var rs = repos.filter(function(r){
      if(type === 'own' && r.fork) return false;
      if(type === 'fork' && !r.fork) return false;
      if(lf && r.lang !== lf) return false;
      if(term && (r.name + ' ' + r.desc).toLowerCase().indexOf(term) < 0) return false;
      return true;
    }).sort(function(a, b){ return a.pushed < b.pushed ? 1 : -1; });
    var loc = lang() === 'en' ? 'en-CA' : 'fr-CA';
    list.innerHTML = rs.slice(0, shown).map(function(r){
      var d = new Date(r.pushed + 'T12:00:00').toLocaleDateString(loc, {year:'numeric', month:'short'});
      return '<li class="repo" style="--c:' + cvar(lc(r.lang)) + '">' +
        '<a class="nm" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.name) + '</a>' +
        (r.desc ? '<p>' + esc(r.desc) + '</p>' : '<p class="dim">' + t('Pas de description.', 'No description.') + '</p>') +
        '<div class="rm">' + (r.lang ? '<span><i class="ld"></i>' + esc(r.lang) + '</span>' : '') +
        (r.stars ? '<span>' + icon('star') + r.stars + '</span>' : '') +
        '<span>' + icon('clock') + d + '</span>' +
        (r.fork ? '<span class="fk">fork</span>' : '') + '</div></li>';
    }).join('') || '<li class="empty">' + t('Aucun dépôt ne correspond.', 'No repository matches.') + '</li>';
    more.hidden = rs.length <= shown;
    count.textContent = Math.min(shown, rs.length) + ' / ' + rs.length;
  };
  if(list){
    var ls = {};
    repos.forEach(function(r){ if(r.lang) ls[r.lang] = (ls[r.lang] || 0) + 1; });
    Object.keys(ls).sort().forEach(function(l){
      var o = document.createElement('option'); o.value = l; o.textContent = l + ' (' + ls[l] + ')'; sel.appendChild(o);
    });
    q.addEventListener('input', function(){ shown = 12; drawRepos(); });
    sel.addEventListener('change', function(){ shown = 12; drawRepos(); });
    $$('#repo-type button').forEach(function(b){
      b.addEventListener('click', function(){
        type = b.getAttribute('data-type'); shown = 12;
        $$('#repo-type button').forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        drawRepos();
      });
    });
    more.addEventListener('click', function(){ shown += 12; drawRepos(); });
  }

  var drawAll = function(){ fill(); drawBars(); drawYears(); drawRepos(); };
  drawAll();
  var charts = $('#gh-charts'), drawn = false;
  var go = function(){ drawn = true; requestAnimationFrame(function(){ requestAnimationFrame(animateCharts); }); };
  if(charts && 'IntersectionObserver' in window && !reduce){
    var cio = new IntersectionObserver(function(es){ if(es[0].isIntersecting){ go(); cio.disconnect(); } }, {threshold:.25});
    cio.observe(charts);
  }else go();
  document.addEventListener('langchange', function(){ drawAll(); if(drawn) animateCharts(); });
}

/* ---------- cookie page: forget this site's settings ---------- */
$$('[data-clear-settings]').forEach(function(b){
  b.addEventListener('click', function(){
    try{ ['lang', 'theme', 'notice-ok'].forEach(function(k){ localStorage.removeItem(k); }); }catch(e){}
    $$('[data-cleared]').forEach(function(el){ el.hidden = false; });
  });
});

/* ---------- year in footer ---------- */
$$('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });

/* ---------- start in the saved language (French by default) ---------- */
if(store.get('lang') === 'en') setLang('en');
})();
