/* Admin home: the site's menu as a simple list. Each row opens that item's editor.
   Shown on the panel's collection pages (after login and when coming back via "Menu"). */
(function () {
  'use strict';

  var ICON = {
    gallery: '<rect x="3.5" y="5.5" width="17" height="13" rx="1"/><path d="M3.5 15l4.5-4 4 3.5 3-2.5 5.5 4.5"/><circle cx="15.5" cy="9.5" r="1.3"/><path d="M6 3.5h14.5V16"/>',
    folder: '<rect x="3.5" y="7.5" width="17" height="10" rx="1"/><path d="M11 12.5h2"/>',
    page: '<path d="M6.5 8.5l3-3h8v13h-11z"/><path d="M6.5 8.5h3v-3"/>',
    link: '<path d="M10 14l4-4"/><path d="M8.5 11.5l-2 2a3 3 0 004 4l2-2"/><path d="M15.5 12.5l2-2a3 3 0 00-4-4l-2 2"/>',
    home: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6.5 9.5v9h11v-9"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2L18 18M6 18l1.8-1.8M16.2 7.8L18 6"/>'
  };
  var CHEV = '<svg viewBox="0 0 24 24" class="vn-chev"><path d="M9.5 6l6 6-6 6"/></svg>';

  var E = '#/collections/';
  var MENU = [
    { head: 'Main navigation' },
    { label: 'Interior', icon: 'gallery', href: E + 'galleries/entries/interior', chev: true },
    { label: 'Editorial', icon: 'gallery', href: E + 'galleries/entries/editorial', chev: true },
    { label: 'Exhibits', icon: 'folder', folder: true },
    { label: 'Book Lab', icon: 'page', href: E + 'pages/entries/book-lab', sub: true },
    { label: 'Auction', icon: 'page', href: E + 'pages/entries/auction', sub: true },
    { label: 'Fresh Brains', icon: 'page', href: E + 'pages/entries/fresh-brains', sub: true },
    { label: 'Quick Art', icon: 'page', href: E + 'pages/entries/quick-art', sub: true, last: true },
    { label: 'In Print', icon: 'gallery', href: E + 'galleries/entries/inprint', chev: true },
    { label: 'Home', icon: 'gallery', href: E + 'galleries/entries/home', chev: true },
    { head: 'Secondary navigation' },
    { label: 'About', icon: 'page', href: E + 'pages/entries/about' },
    { label: 'Behance', icon: 'link', href: E + 'site/entries/settings' },
    { label: 'Instagram', icon: 'link', href: E + 'site/entries/settings' },
    { label: 'Contact', icon: 'link', href: E + 'site/entries/settings' },
    { head: 'Site' },
    { label: 'Cover page', icon: 'home', href: E + 'site/entries/cover' },
    { label: 'Site settings', icon: 'gear', href: E + 'site/entries/settings' }
  ];

  var css = [
    '#vn-home{position:fixed;left:0;right:0;bottom:0;background:#fff;z-index:150;overflow:auto;font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;color:#222}',
    '#vn-home[hidden]{display:none}',
    '.vn-wrap{max-width:420px;padding:36px 0 60px}',
    '.vn-head{font-size:13px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#333;padding:34px 40px 14px}',
    '.vn-head:first-child{padding-top:10px}',
    '.vn-row{position:relative;display:flex;align-items:center;gap:18px;padding:0 40px;height:46px;font-size:16px;color:#222;text-decoration:none}',
    'a.vn-row:hover{background:#efefef}',
    '.vn-row svg.vn-ic{width:24px;height:24px;flex:none;fill:none;stroke:#444;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round}',
    '.vn-row .vn-label{flex:1}',
    '.vn-chev{width:18px;height:18px;fill:none;stroke:#999;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}',
    '.vn-row.vn-folder .vn-chev{transform:rotate(90deg);stroke:#333}',
    '.vn-row.vn-sub{padding-left:84px;height:44px}',
    '.vn-row.vn-sub:before{content:"";position:absolute;left:52px;top:0;bottom:0;border-left:1px solid #ccc}',
    '.vn-row.vn-sub.vn-last:before{bottom:50%}',
    '.vn-row.vn-sub:after{content:"";position:absolute;left:52px;width:12px;top:50%;border-top:1px solid #ccc}'
  ].join('\n');

  function build() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var box = document.createElement('div');
    box.id = 'vn-home';
    box.hidden = true;
    var html = '<div class="vn-wrap">';
    MENU.forEach(function (m) {
      if (m.head) { html += '<div class="vn-head">' + m.head + '</div>'; return; }
      var cls = 'vn-row' + (m.sub ? ' vn-sub' : '') + (m.last ? ' vn-last' : '') + (m.folder ? ' vn-folder' : '');
      var inner = '<svg viewBox="0 0 24 24" class="vn-ic">' + ICON[m.icon] + '</svg><span class="vn-label">' + m.label + '</span>' +
        (m.chev || m.folder ? CHEV : '');
      html += m.href ? '<a class="' + cls + '" href="' + m.href + '">' + inner + '</a>' : '<div class="' + cls + '">' + inner + '</div>';
    });
    html += '</div>';
    box.innerHTML = html;
    document.body.appendChild(box);
    return box;
  }

  function loggedIn() {
    try {
      if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) return true;
      return !!window.localStorage.getItem('decap-cms-user');
    } catch (e) { return false; }
  }

  // Sit just below the panel's own top bar so its buttons (media, log out) stay usable
  function headerBottom() {
    var hdr = document.querySelector('header');
    if (!hdr) return 0;
    var r = hdr.getBoundingClientRect();
    return r.bottom > 0 && r.bottom < 200 ? Math.round(r.bottom) : 0;
  }

  var box;
  function update() {
    if (!box) box = build();
    var hash = location.hash || '';
    var listView = hash === '' || hash === '#/' || (hash.indexOf('#/collections') === 0 && hash.indexOf('/entries/') === -1 && hash.indexOf('/new') === -1);
    var show = listView && loggedIn() && !!document.querySelector('header');
    box.hidden = !show;
    if (show) box.style.top = headerBottom() + 'px';
  }

  window.addEventListener('hashchange', update);
  setInterval(update, 600);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', update); else update();
})();
