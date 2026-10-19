/* VOLGA YILDIZ — renders every page from the JSON files in /content.
   The admin panel (/admin) edits those JSON files; nothing else needs changing. */
(function () {
  'use strict';

  var body = document.body;
  var PAGE = body.getAttribute('data-page');
  var ROOT = body.hasAttribute('data-root') ? body.getAttribute('data-root') : '/';
  // Pretty URLs on the live site (/interior/); explicit index.html when previewed elsewhere.
  var PRETTY = body.getAttribute('data-pretty') !== 'false';

  function url(p) {
    if (!p) return '';
    if (/^(https?:|mailto:|data:)/.test(p)) return p;
    return ROOT + p.replace(/^\//, '');
  }
  function link(slug) { return ROOT + slug + (PRETTY ? '/' : '/index.html'); }
  function getJSON(path) {
    return fetch(url(path), { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(path + ' ' + r.status);
      return r.json();
    });
  }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  // Netlify Identity invite / password-reset links land on the home page: forward them to the panel.
  if (/(invite|recovery|confirmation|email_change)_token=/.test(location.hash)) {
    location.replace(ROOT + 'admin/' + location.hash);
    return;
  }

  var GALLERIES = ['home', 'interior', 'editorial', 'inprint'];
  var EXHIBITS = [['book-lab', 'Book Lab'], ['auction', 'Auction'], ['fresh-brains', 'Fresh Brains'], ['quick-art', 'Quick Art']];
  var PAGEFILE = { 'book-lab': 'book-lab', auction: 'auction', 'fresh-brains': 'fresh-brains', 'quick-art': 'quick-art', contact: 'about' };

  getJSON('/content/settings.json').then(function (settings) {
    if (settings.logo) {
      var icon = document.querySelector('link[rel="icon"]') || el('link', { rel: 'icon' });
      icon.href = url(settings.logo);
      document.head.appendChild(icon);
    }
    if (PAGE === 'cover') return renderCover(settings);
    renderSide(settings);
    if (GALLERIES.indexOf(PAGE) >= 0) return renderGallery(settings);
    if (PAGEFILE[PAGE]) return renderPage(settings);
  }).catch(function (e) { console.error(e); });

  /* ---------------------------------------------------------------- cover */
  function renderCover(settings) {
    getJSON('/content/cover.json').then(function (c) {
      document.title = settings.title;
      var wrap = el('div', { class: 'cover' });
      var slides = (c.slides || []).map(function (s, i) {
        var d = el('div', { class: 'slide' + (i === 0 ? ' on' : '') });
        d.style.backgroundImage = 'url("' + url(s.image) + '")';
        wrap.appendChild(d);
        return d;
      });
      wrap.appendChild(el('div', { class: 'brand-c', text: settings.title }));
      wrap.appendChild(el('a', { class: 'enter', href: link('home'), text: c.button || 'come in' }));
      body.appendChild(wrap);
      var i = 0;
      if (slides.length > 1) setInterval(function () {
        slides[i].classList.remove('on');
        i = (i + 1) % slides.length;
        slides[i].classList.add('on');
      }, 4500);
    });
  }

  /* ---------------------------------------------------------------- sidebar */
  function renderSide(settings) {
    var side = el('aside', { class: 'side' });
    side.appendChild(el('a', { class: 'brand', href: ROOT + (PRETTY ? '' : 'index.html'), text: settings.title }));
    var toggle = el('button', { class: 'menu-toggle', type: 'button', text: 'Menu', 'aria-expanded': 'false' });
    side.appendChild(toggle);

    var navwrap = el('div', { class: 'navwrap' });
    var nav = el('ul', { class: 'nav' });
    function item(slug, label) {
      var a = el('a', { href: link(slug), text: label });
      if (slug === PAGE) a.className = 'active';
      return el('li', null, [a]);
    }
    nav.appendChild(item('interior', 'Interior'));
    nav.appendChild(item('editorial', 'Editorial'));

    var inEx = EXHIBITS.some(function (e) { return e[0] === PAGE; });
    var exBtn = el('button', { type: 'button', text: 'Exhibits', class: inEx ? 'open-active' : '' });
    var sub = el('ul', { class: 'nav-sub' + (inEx ? ' open' : '') });
    EXHIBITS.forEach(function (e) { sub.appendChild(item(e[0], e[1])); });
    exBtn.addEventListener('click', function () { sub.classList.toggle('open'); });
    nav.appendChild(el('li', null, [exBtn, sub]));

    nav.appendChild(item('inprint', 'In Print'));
    nav.appendChild(item('home', 'Home'));
    navwrap.appendChild(nav);

    var nav2 = el('ul', { class: 'nav-2' });
    nav2.appendChild(item('contact', 'About'));
    if (settings.behance) nav2.appendChild(el('li', null, [el('a', { href: settings.behance, target: '_blank', rel: 'noopener', text: 'Behance' })]));
    if (settings.instagram) nav2.appendChild(el('li', null, [el('a', { href: settings.instagram, target: '_blank', rel: 'noopener', text: 'Instagram' })]));
    if (settings.email) nav2.appendChild(el('li', null, [el('a', { href: 'mailto:' + settings.email, text: 'Contact' })]));
    navwrap.appendChild(nav2);
    side.appendChild(navwrap);

    toggle.addEventListener('click', function () {
      var open = navwrap.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });

    side.appendChild(el('div', { class: 'caption', id: 'caption' }));
    side.appendChild(el('div', { class: 'controls', id: 'controls' }));
    body.insertBefore(side, body.firstChild);

    // Line the top of every photo up with the first menu item ("Interior")
    function alignToMenu() {
      var top = nav.getBoundingClientRect().top + 4;
      document.documentElement.style.setProperty('--menu-top', Math.round(top) + 'px');
    }
    alignToMenu();
    window.addEventListener('resize', alignToMenu);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignToMenu);
  }

  /* ---------------------------------------------------------------- gallery */
  function renderGallery(settings) {
    getJSON('/content/galleries/' + PAGE + '.json').then(function (g) {
      document.title = (g.title || PAGE) + ' — ' + settings.title;
      var photos = (g.photos || []).filter(function (p) { return p && p.image; });
      var main = el('main', { class: 'main' });
      var stage = el('div', { class: 'stage' });
      var img = el('img', { alt: '' });
      var prevHit = el('button', { class: 'hit prev', type: 'button', 'aria-label': 'Previous' });
      var nextHit = el('button', { class: 'hit next', type: 'button', 'aria-label': 'Next' });
      var mcap = el('div', { class: 'mobile-cap' }, [el('span', { class: 'cap' }), el('span', { class: 'count' })]);
      stage.appendChild(img); stage.appendChild(prevHit); stage.appendChild(nextHit); stage.appendChild(mcap);
      var thumbs = el('div', { class: 'thumbs' });
      main.appendChild(stage); main.appendChild(thumbs);
      body.appendChild(main);

      var cap = document.getElementById('caption');
      var controls = document.getElementById('controls');
      var idx = 0;

      function show(i, push) {
        if (!photos.length) return;
        idx = (i + photos.length) % photos.length;
        var p = photos[idx];
        img.classList.remove('ready');
        var src = url(p.image);
        var pre = new Image();
        pre.onload = function () { img.src = src; img.alt = (p.caption || '').replace(/\n/g, ', '); img.classList.add('ready'); };
        pre.src = src;
        cap.textContent = p.caption || '';
        mcap.firstChild.textContent = p.caption || '';
        mcap.lastChild.textContent = (idx + 1) + ' / ' + photos.length;
        counter.textContent = (idx + 1) + ' / ' + photos.length;
        [1, -1].forEach(function (d) { var n = photos[(idx + d + photos.length) % photos.length]; if (n) new Image().src = url(n.image); });
        if (push !== false) history.replaceState(null, '', '#' + (idx + 1));
      }
      function setThumbs(on) {
        thumbs.classList.toggle('on', on);
        stage.style.display = on ? 'none' : '';
        thumbBtn.textContent = on ? 'hide thumbnails' : 'show thumbnails';
        cap.style.opacity = on ? 0 : 1;
      }

      var prevBtn = el('button', { type: 'button', text: 'prev' });
      var nextBtn = el('button', { type: 'button', text: 'next' });
      var counter = el('span');
      var thumbBtn = el('button', { type: 'button', text: 'show thumbnails' });
      if (photos.length > 1) {
        controls.appendChild(el('span', null, [prevBtn, document.createTextNode(' / '), nextBtn]));
        controls.appendChild(counter);
        controls.appendChild(thumbBtn);
      } else {
        prevHit.style.display = nextHit.style.display = 'none';
        mcap.lastChild.style.display = 'none';
      }

      photos.forEach(function (p, i) {
        var b = el('button', { type: 'button', 'aria-label': 'Photo ' + (i + 1) }, [el('img', { src: url(p.image), loading: 'lazy', alt: '' })]);
        b.addEventListener('click', function () { setThumbs(false); show(i); window.scrollTo(0, 0); });
        thumbs.appendChild(b);
      });

      prevBtn.onclick = prevHit.onclick = function () { show(idx - 1); };
      nextBtn.onclick = nextHit.onclick = function () { show(idx + 1); };
      thumbBtn.onclick = function () { setThumbs(!thumbs.classList.contains('on')); };
      document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') show(idx - 1);
        else if (e.key === 'ArrowRight') show(idx + 1);
        else if (e.key === 'Escape') setThumbs(false);
      });
      var x0 = null;
      stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      stage.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
      });

      var start = parseInt(location.hash.slice(1), 10);
      show(start > 0 ? start - 1 : 0, false);
    });
  }

  /* ---------------------------------------------------------------- text pages */
  function renderPage(settings) {
    getJSON('/content/pages/' + PAGEFILE[PAGE] + '.json').then(function (p) {
      document.title = (p.title || PAGE) + ' — ' + settings.title;
      var main = el('main', { class: 'main' });
      var images = (p.images || []).filter(function (im) { return im && im.image; });
      function figure(im) {
        return el('figure', null, [
          el('img', { src: url(im.image), alt: (im.caption || '').replace(/\n/g, ', ') }),
          im.caption ? el('figcaption', { text: im.caption }) : null
        ]);
      }
      var page;
      if (PAGE === 'contact') {
        // About: text on the left, photo on the right, side by side (as on the old site)
        page = el('div', { class: 'about' }, [
          el('div', { class: 'about-text' }, [el('p', { text: p.text || '' })]),
          images[0] ? el('div', { class: 'about-photo' }, [el('img', { src: url(images[0].image), alt: '' })]) : null
        ]);
        images.slice(1).forEach(function (im) { page.appendChild(figure(im)); });
      } else {
        // Exhibits: first image at the top (level with the menu), then the text, then the rest
        page = el('div', { class: 'page' });
        if (images[0]) page.appendChild(figure(images[0]));
        if (p.text) page.appendChild(el('div', { class: 'text', text: p.text }));
        if (p.video) {
          var v = el('video', { controls: '', preload: 'metadata', playsinline: '', src: url(p.video) });
          if (p.video_poster) v.setAttribute('poster', url(p.video_poster));
          page.appendChild(el('figure', null, [v]));
        }
        images.slice(1).forEach(function (im) { page.appendChild(figure(im)); });
      }
      main.appendChild(page);
      body.appendChild(main);
    });
  }
})();
