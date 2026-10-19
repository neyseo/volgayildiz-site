/* Gallery editor for the admin panel: photos as a grid of thumbnails.
   Drag a thumbnail to move it, edit its caption underneath, × removes it. */
(function () {
  'use strict';
  var h = window.h, createClass = window.createClass, CMS = window.CMS;
  if (!h || !createClass || !CMS) return;

  var css = [
    '.tw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;margin:6px 0 14px}',
    '.tw-item{background:#f3f3f5;border:2px solid transparent;border-radius:6px;padding:6px;display:flex;flex-direction:column;gap:6px}',
    '.tw-item.over{border-color:#3a69c7;background:#e8eefb}',
    '.tw-item.dragging{opacity:.4}',
    '.tw-img{position:relative;height:150px;background:#e2e2e6;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:grab;overflow:hidden}',
    '.tw-img:active{cursor:grabbing}',
    '.tw-img img{max-width:100%;max-height:100%;display:block;pointer-events:none}',
    '.tw-img .tw-missing{font-size:11px;color:#777;padding:8px;text-align:center}',
    '.tw-num{position:absolute;left:6px;top:6px;background:rgba(0,0,0,.65);color:#fff;font:600 11px/1 sans-serif;padding:4px 6px;border-radius:3px}',
    '.tw-x{position:absolute;right:6px;top:6px;width:24px;height:24px;border:0;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;font-size:16px;line-height:24px;cursor:pointer;padding:0}',
    '.tw-x:hover{background:#c0392b}',
    '.tw-cap{width:100%;box-sizing:border-box;font:13px/1.4 sans-serif;padding:6px;border:1px solid #d5d5da;border-radius:4px;resize:vertical;min-height:44px}',
    '.tw-arrows{display:flex;justify-content:space-between}',
    '.tw-arrows button{border:1px solid #d5d5da;background:#fff;border-radius:4px;padding:2px 10px;cursor:pointer}',
    '.tw-arrows button:disabled{opacity:.3;cursor:default}',
    '.tw-add{border:1px dashed #9a9aa5;background:#fff;border-radius:6px;padding:10px 16px;cursor:pointer;font-weight:600}',
    '.tw-hint{font-size:12px;color:#777;margin:0 0 6px}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function toArr(v) {
    if (!v) return [];
    if (typeof v.toJS === 'function') return v.toJS();
    return Array.isArray(v) ? v.slice() : [];
  }

  var ThumbsControl = createClass({
    getInitialState: function () {
      this.controlID = 'thumbs-' + Math.random().toString(36).slice(2);
      this.handled = null;
      return { drag: null, over: null };
    },

    // Picks up photos chosen in the media library
    componentDidUpdate: function () {
      var mp = this.props.mediaPaths;
      if (!mp || typeof mp.get !== 'function') return;
      var sel = mp.get(this.controlID);
      if (!sel || sel === this.handled) return;
      this.handled = sel;
      if (this.props.onRemoveInsertedMedia) this.props.onRemoveInsertedMedia(this.controlID);
      var picked = typeof sel === 'string' ? [sel] : toArr(sel);
      var arr = toArr(this.props.value);
      picked.forEach(function (p) {
        var path = typeof p === 'string' ? p : (p && (p.path || p.url));
        if (path) arr.push({ image: path, caption: '' });
      });
      this.emit(arr);
    },

    emit: function (arr) {
      var field = this.props.field;
      var ListOf = field.get('fields').constructor;   // Immutable List
      var MapOf = field.constructor;                  // Immutable Map
      this.props.onChange(ListOf(arr.map(function (o) { return MapOf(o); })));
    },

    move: function (from, to) {
      var arr = toArr(this.props.value);
      if (from === null || to < 0 || to >= arr.length || from === to) return;
      var item = arr.splice(from, 1)[0];
      arr.splice(to, 0, item);
      this.emit(arr);
    },

    remove: function (i) {
      if (!window.confirm('Bu fotoğraf galeriden kaldırılsın mı?')) return;
      var arr = toArr(this.props.value);
      arr.splice(i, 1);
      this.emit(arr);
    },

    setCaption: function (i, text) {
      var arr = toArr(this.props.value);
      arr[i] = { image: arr[i].image, caption: text };
      this.emit(arr);
    },

    add: function () {
      this.handled = null;
      this.props.onOpenMediaLibrary({
        controlID: this.controlID,
        forImage: true,
        allowMultiple: true,
        value: '',
        field: this.props.field,
        config: this.props.field.get('media_library')
      });
    },

    render: function () {
      var self = this;
      var items = toArr(this.props.value);
      var st = this.state;
      return h('div', { className: 'tw' },
        h('p', { className: 'tw-hint' }, 'Sırayı değiştirmek için fotoğrafı tutup sürükleyin. Açıklamada Enter ile alt satıra geçilir.'),
        h('div', { className: 'tw-grid' }, items.map(function (it, i) {
          var cls = 'tw-item' + (st.over === i && st.drag !== i ? ' over' : '') + (st.drag === i ? ' dragging' : '');
          return h('div', {
            key: i + '|' + it.image,
            className: cls,
            onDragOver: function (e) { e.preventDefault(); if (st.over !== i) self.setState({ over: i }); },
            onDrop: function (e) { e.preventDefault(); self.move(st.drag, i); self.setState({ drag: null, over: null }); }
          },
            h('div', {
              className: 'tw-img',
              draggable: true,
              onDragStart: function (e) {
                try { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
                self.setState({ drag: i });
              },
              onDragEnd: function () { self.setState({ drag: null, over: null }); }
            },
              it.image ? h('img', {
                src: it.image, alt: '',
                onError: function (e) { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }
              }) : null,
              h('div', { className: 'tw-missing', style: { display: it.image ? 'none' : 'block' } }, 'Önizleme kaydettikten sonra görünür'),
              h('span', { className: 'tw-num' }, String(i + 1)),
              h('button', { type: 'button', className: 'tw-x', title: 'Kaldır', onClick: function () { self.remove(i); } }, '×')
            ),
            h('textarea', {
              className: 'tw-cap', rows: 2, placeholder: 'Açıklama (sol altta görünür)',
              value: it.caption || '',
              onChange: function (e) { self.setCaption(i, e.target.value); }
            }),
            h('div', { className: 'tw-arrows' },
              h('button', { type: 'button', title: 'Sola taşı', disabled: i === 0, onClick: function () { self.move(i, i - 1); } }, '←'),
              h('button', { type: 'button', title: 'Sağa taşı', disabled: i === items.length - 1, onClick: function () { self.move(i, i + 1); } }, '→')
            )
          );
        })),
        h('button', { type: 'button', className: 'tw-add', onClick: this.add }, '+ Fotoğraf ekle')
      );
    }
  });

  CMS.registerWidget('thumbs', ThumbsControl);
})();
