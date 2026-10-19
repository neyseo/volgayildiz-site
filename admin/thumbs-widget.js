/* Gallery editor for the admin panel: photos as a clean grid of thumbnails.
   Drag a photo to move it. Hovering shows a toolbar: move left/right, edit caption, remove. */
(function () {
  'use strict';
  var h = window.h, createClass = window.createClass, CMS = window.CMS;
  if (!h || !createClass || !CMS) return;

  var css = [
    '.tw{background:#fff;padding:18px;border-radius:6px}',
    '.tw-hint{font-size:12px;color:#888;margin:0 0 16px}',
    '.tw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:28px 22px;margin:0 0 22px}',
    '.tw-item{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:8px;border-radius:8px;outline:2px solid transparent;outline-offset:6px;transition:outline-color .15s}',
    '.tw-item.over{outline-color:#3a69c7}',
    '.tw-item.dragging{opacity:.35}',
    '.tw-img{position:relative;height:230px;display:flex;align-items:flex-end;cursor:grab}',
    '.tw-img:active{cursor:grabbing}',
    '.tw-img img{max-height:230px;max-width:100%;border-radius:6px;display:block;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.08)}',
    '.tw-missing{width:170px;height:230px;border-radius:6px;background:#f2f2f2;color:#888;font-size:11px;display:flex;align-items:center;justify-content:center;text-align:center;padding:10px;box-sizing:border-box}',
    '.tw-bar{position:absolute;left:8px;top:8px;display:flex;gap:2px;background:rgba(40,40,40,.88);border-radius:8px;padding:4px;opacity:0;transform:translateY(-4px);transition:opacity .15s,transform .15s;pointer-events:none;z-index:2}',
    '.tw-item:hover .tw-bar,.tw-item:focus-within .tw-bar{opacity:1;transform:none;pointer-events:auto}',
    '.tw-bar button{width:32px;height:32px;border:0;border-radius:6px;background:transparent;color:#ddd;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '.tw-bar button:hover{background:rgba(255,255,255,.14);color:#fff}',
    '.tw-bar button.del:hover{background:#c0392b}',
    '.tw-bar button:disabled{opacity:.3;cursor:default;background:transparent}',
    '.tw-bar svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
    '.tw-num{position:absolute;right:8px;top:8px;background:rgba(40,40,40,.75);color:#fff;font:600 11px/1 sans-serif;padding:5px 7px;border-radius:5px;opacity:0;transition:opacity .15s}',
    '.tw-item:hover .tw-num{opacity:1}',
    '.tw-cap-text{font:12px/1.45 sans-serif;color:#777;white-space:pre-line;max-width:100%;min-height:1em}',
    '.tw-cap-text.empty{color:#bbb;font-style:italic}',
    '.tw-cap{width:100%;box-sizing:border-box;font:13px/1.4 sans-serif;padding:7px;border:1px solid #cfd3da;border-radius:6px;resize:vertical;min-height:52px}',
    '.tw-done{align-self:flex-end;border:0;background:#3a69c7;color:#fff;border-radius:5px;padding:4px 12px;font-size:12px;cursor:pointer}',
    '.tw-add{border:1px dashed #b5b5bd;background:#fff;border-radius:8px;padding:12px 18px;cursor:pointer;font-weight:600;color:#444}',
    '.tw-add:hover{border-color:#3a69c7;color:#3a69c7}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function icon(path) {
    return h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, h('path', { d: path }));
  }
  var ICON = {
    left: 'M15 6l-6 6 6 6',
    right: 'M9 6l6 6-6 6',
    edit: 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
    trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3'
  };

  function toArr(v) {
    if (!v) return [];
    if (typeof v.toJS === 'function') return v.toJS();
    return Array.isArray(v) ? v.slice() : [];
  }

  var ThumbsControl = createClass({
    getInitialState: function () {
      this.controlID = 'thumbs-' + Math.random().toString(36).slice(2);
      this.handled = null;
      return { drag: null, over: null, editing: null };
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
      this.setState({ editing: null });
      this.emit(arr);
    },

    remove: function (i) {
      if (!window.confirm('Bu fotoğraf galeriden kaldırılsın mı?')) return;
      var arr = toArr(this.props.value);
      arr.splice(i, 1);
      this.setState({ editing: null });
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
        h('p', { className: 'tw-hint' }, 'Sırayı değiştirmek için fotoğrafı tutup sürükleyin. Fareyle üzerine gelince ayarlar çıkar.'),
        h('div', { className: 'tw-grid' }, items.map(function (it, i) {
          var editing = st.editing === i;
          var cls = 'tw-item' + (st.over === i && st.drag !== null && st.drag !== i ? ' over' : '') + (st.drag === i ? ' dragging' : '');
          return h('div', {
            key: i + '|' + it.image,
            className: cls,
            onDragOver: function (e) { e.preventDefault(); if (st.over !== i) self.setState({ over: i }); },
            onDrop: function (e) { e.preventDefault(); self.move(st.drag, i); self.setState({ drag: null, over: null }); }
          },
            h('div', {
              className: 'tw-img',
              draggable: !editing,
              onDragStart: function (e) {
                try { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
                self.setState({ drag: i });
              },
              onDragEnd: function () { self.setState({ drag: null, over: null }); }
            },
              it.image ? h('img', {
                src: it.image, alt: '',
                onError: function (e) { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }
              }) : null,
              h('div', { className: 'tw-missing', style: { display: it.image ? 'none' : 'flex' } }, 'Önizleme kaydettikten sonra görünür'),
              h('div', { className: 'tw-bar' },
                h('button', { type: 'button', title: 'Sola taşı', disabled: i === 0, onClick: function () { self.move(i, i - 1); } }, icon(ICON.left)),
                h('button', { type: 'button', title: 'Sağa taşı', disabled: i === items.length - 1, onClick: function () { self.move(i, i + 1); } }, icon(ICON.right)),
                h('button', { type: 'button', title: 'Açıklamayı düzenle', onClick: function () { self.setState({ editing: editing ? null : i }); } }, icon(ICON.edit)),
                h('button', { type: 'button', title: 'Kaldır', className: 'del', onClick: function () { self.remove(i); } }, icon(ICON.trash))
              ),
              h('span', { className: 'tw-num' }, String(i + 1))
            ),
            editing
              ? h('textarea', {
                  className: 'tw-cap', rows: 2, autoFocus: true,
                  placeholder: 'Açıklama (sol altta görünür)',
                  value: it.caption || '',
                  onChange: function (e) { self.setCaption(i, e.target.value); }
                })
              : h('div', { className: 'tw-cap-text' + (it.caption ? '' : ' empty') }, it.caption || 'açıklama yok'),
            editing ? h('button', { type: 'button', className: 'tw-done', onClick: function () { self.setState({ editing: null }); } }, 'Tamam') : null
          );
        })),
        h('button', { type: 'button', className: 'tw-add', onClick: this.add }, '+ Fotoğraf ekle')
      );
    }
  });

  CMS.registerWidget('thumbs', ThumbsControl);
})();
