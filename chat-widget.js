/* スマートWEB チャット受付ウィジェット v2
   - ボタンをドラッグで自由に移動可能（位置は記憶されます）
   - 設置方法：</body> の直前に <script defer src="/chat-widget.js"></script> を1行追加するだけ */
(function () {
  'use strict';
  if (window.__swChatLoaded) return;
  window.__swChatLoaded = true;

  var API = '/api/chat';
  var MAX_TURNS = 20;
  var BTN = 60, GAP = 12;

  /* ---------- styles ---------- */
  var css = ''
    + '.swc-btn{position:fixed;z-index:9990;width:' + BTN + 'px;height:' + BTN + 'px;border-radius:50%;border:none;cursor:grab;background:linear-gradient(120deg,#06B6D4,#2563EB);box-shadow:0 10px 28px rgba(37,99,235,.4);display:flex;align-items:center;justify-content:center;transition:box-shadow .2s;touch-action:none;user-select:none;-webkit-user-select:none}'
    + '.swc-btn:hover{box-shadow:0 14px 34px rgba(37,99,235,.5)}'
    + '.swc-btn.dragging{cursor:grabbing;transition:none;opacity:.9}'
    + '.swc-btn svg{width:28px;height:28px;pointer-events:none}'
    + '.swc-badge{position:absolute;top:-4px;right:-4px;background:#F59E0B;color:#fff;font-size:10px;font-weight:800;border-radius:100px;padding:2px 7px;font-family:sans-serif;pointer-events:none}'
    + '.swc-panel{position:fixed;z-index:9991;width:370px;max-width:calc(100vw - 24px);height:540px;max-height:calc(100vh - 40px);background:#fff;border-radius:18px;box-shadow:0 24px 70px rgba(15,23,41,.28);display:none;flex-direction:column;overflow:hidden;font-family:"Noto Sans JP",-apple-system,sans-serif}'
    + '.swc-panel.open{display:flex}'
    + '.swc-head{background:linear-gradient(120deg,#06B6D4,#2563EB);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}'
    + '.swc-dot{width:9px;height:9px;border-radius:50%;background:#4ADE80;box-shadow:0 0 0 3px rgba(74,222,128,.3);flex-shrink:0}'
    + '.swc-head-t{font-size:13.5px;font-weight:800;line-height:1.4}'
    + '.swc-head-s{font-size:10.5px;opacity:.85}'
    + '.swc-close{margin-left:auto;background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1;padding:4px;opacity:.85}'
    + '.swc-body{flex:1;overflow-y:auto;padding:16px 14px;background:#F6F9FD;display:flex;flex-direction:column;gap:10px}'
    + '.swc-msg{max-width:85%;font-size:12.5px;line-height:1.85;padding:10px 14px;border-radius:15px;white-space:pre-wrap;word-break:break-word}'
    + '.swc-msg.u{align-self:flex-end;background:#2563EB;color:#fff;border-bottom-right-radius:4px}'
    + '.swc-msg.b{align-self:flex-start;background:#fff;border:1px solid #E4E9F1;color:#0F1729;border-bottom-left-radius:4px}'
    + '.swc-chips{display:flex;flex-wrap:wrap;gap:6px}'
    + '.swc-chip{background:#fff;border:1.5px solid #CFE0F5;color:#2563EB;font-size:11.5px;font-weight:700;border-radius:100px;padding:7px 13px;cursor:pointer;transition:background .2s;font-family:inherit}'
    + '.swc-chip:hover{background:#EFF6FF}'
    + '.swc-typing{align-self:flex-start;background:#fff;border:1px solid #E4E9F1;border-radius:15px;border-bottom-left-radius:4px;padding:12px 16px;display:flex;gap:5px}'
    + '.swc-typing i{width:7px;height:7px;border-radius:50%;background:#93A5C1;animation:swcB 1.2s infinite}'
    + '.swc-typing i:nth-child(2){animation-delay:.15s}.swc-typing i:nth-child(3){animation-delay:.3s}'
    + '@keyframes swcB{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}'
    + '.swc-input{display:flex;gap:8px;padding:12px;border-top:1px solid #E4E9F1;background:#fff;flex-shrink:0}'
    + '.swc-input input{flex:1;border:1.5px solid #E4E9F1;border-radius:100px;padding:11px 16px;font-size:13px;font-family:inherit;outline:none;min-width:0}'
    + '.swc-input input:focus{border-color:#2563EB}'
    + '.swc-send{width:42px;height:42px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(120deg,#06B6D4,#2563EB);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.swc-send:disabled{opacity:.5;cursor:default}'
    + '.swc-foot{text-align:center;padding:7px 10px;background:#fff;flex-shrink:0}'
    + '.swc-foot a{font-size:10.5px;color:#5B6B84;text-decoration:underline;text-underline-offset:2px}'
    + '.swc-note{font-size:9.5px;color:#9AA6B8;text-align:center;padding:0 14px 8px;background:#F6F9FD}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- DOM ---------- */
  var btn = document.createElement('button');
  btn.className = 'swc-btn';
  btn.setAttribute('aria-label', 'チャットで質問する');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span class="swc-badge">24H</span>';

  var panel = document.createElement('div');
  panel.className = 'swc-panel';
  panel.innerHTML = ''
    + '<div class="swc-head"><span class="swc-dot"></span><div><div class="swc-head-t">スマートWEB 受付チャット</div><div class="swc-head-s">24時間ご質問にお答えします</div></div><button class="swc-close" aria-label="閉じる">×</button></div>'
    + '<div class="swc-body"></div>'
    + '<div class="swc-note">自動応答のため、内容が正確でない場合があります。正式なご相談はフォームからどうぞ。</div>'
    + '<div class="swc-input"><input type="text" placeholder="ご質問を入力…" maxlength="300"><button class="swc-send" aria-label="送信"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></div>'
    + '<div class="swc-foot"><a href="/services.html#chat">このチャット受付、あなたのお店にも設置できます →</a></div>';

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  var body = panel.querySelector('.swc-body');
  var input = panel.querySelector('input');
  var send = panel.querySelector('.swc-send');

  /* ---------- ボタン位置（ドラッグ可能・記憶） ---------- */
  function clampPos(x, y) {
    var mx = window.innerWidth - BTN - 8;
    var my = window.innerHeight - BTN - 8;
    return { x: Math.min(Math.max(8, x), mx), y: Math.min(Math.max(8, y), my) };
  }
  function defaultPos() {
    return clampPos(window.innerWidth - BTN - 20, window.innerHeight - BTN - 20);
  }
  var pos = defaultPos();
  try {
    var saved = JSON.parse(localStorage.getItem('swc-pos') || 'null');
    if (saved && typeof saved.x === 'number') pos = clampPos(saved.x, saved.y);
  } catch (e) {}

  function applyPos() {
    btn.style.left = pos.x + 'px';
    btn.style.top = pos.y + 'px';
    if (panel.classList.contains('open')) placePanel();
  }

  /* パネルはボタンの位置に応じて上下左右に自動配置 */
  function placePanel() {
    var pw = Math.min(370, window.innerWidth - 24);
    var ph = Math.min(540, window.innerHeight - 40);
    var cx = pos.x + BTN / 2;

    // 横：ボタンが画面右寄りなら右端を揃え、左寄りなら左端を揃える
    var left = (cx > window.innerWidth / 2) ? (pos.x + BTN - pw) : pos.x;
    left = Math.min(Math.max(12, left), window.innerWidth - pw - 12);

    // 縦：上に空きがあれば上に、なければ下に開く
    var top;
    if (pos.y >= ph + GAP + 10) top = pos.y - ph - GAP;
    else if (window.innerHeight - (pos.y + BTN) >= ph + GAP + 10) top = pos.y + BTN + GAP;
    else top = Math.max(20, (window.innerHeight - ph) / 2);

    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  }

  var dragging = false, moved = false, offX = 0, offY = 0;
  btn.addEventListener('pointerdown', function (e) {
    dragging = true; moved = false;
    offX = e.clientX - pos.x; offY = e.clientY - pos.y;
    btn.classList.add('dragging');
    btn.setPointerCapture(e.pointerId);
  });
  btn.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var nx = e.clientX - offX, ny = e.clientY - offY;
    if (!moved && Math.abs(nx - pos.x) + Math.abs(ny - pos.y) > 6) moved = true;
    if (moved) { pos = clampPos(nx, ny); applyPos(); }
  });
  btn.addEventListener('pointerup', function (e) {
    dragging = false;
    btn.classList.remove('dragging');
    if (moved) {
      try { localStorage.setItem('swc-pos', JSON.stringify(pos)); } catch (err) {}
    } else {
      togglePanel();
    }
  });
  btn.addEventListener('pointercancel', function () {
    dragging = false;
    btn.classList.remove('dragging');
  });
  window.addEventListener('resize', function () {
    pos = clampPos(pos.x, pos.y);
    applyPos();
  });
  applyPos();

  /* ---------- state ---------- */
  var history = [];
  try {
    var h = sessionStorage.getItem('swc-history');
    if (h) history = JSON.parse(h);
  } catch (e) {}

  function persist() {
    try { sessionStorage.setItem('swc-history', JSON.stringify(history.slice(-20))); } catch (e) {}
  }

  function addMsg(role, text) {
    var d = document.createElement('div');
    d.className = 'swc-msg ' + (role === 'user' ? 'u' : 'b');
    d.textContent = text;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }

  function addChips() {
    var wrap = document.createElement('div');
    wrap.className = 'swc-chips';
    ['料金を知りたい', '無料のホームページ案って？', 'Googleマップの集客って？', '解約はいつでもできる？'].forEach(function (q) {
      var c = document.createElement('button');
      c.className = 'swc-chip';
      c.textContent = q;
      c.onclick = function () { input.value = q; submit(); };
      wrap.appendChild(c);
    });
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function greet() {
    addMsg('bot', 'こんにちは！スマートWEBの受付チャットです。料金やサービスのこと、なんでもお気軽にご質問ください。');
    addChips();
  }

  /* ---------- send ---------- */
  var busy = false;
  var FALLBACK = 'すみません、うまくお答えできませんでした。お問い合わせフォームからご相談ください。';
  function submit() {
    var text = input.value.trim();
    if (!text || busy) return;

    var userTurns = history.filter(function (m) { return m.role === 'user'; }).length;
    if (userTurns >= MAX_TURNS) {
      addMsg('bot', 'たくさんのご質問ありがとうございます！ここから先は、ページ下部のお問い合わせフォームから担当者にご相談ください。無理な営業は一切ありません。');
      return;
    }

    input.value = '';
    addMsg('user', text);
    history.push({ role: 'user', content: text });
    persist();

    var typing = document.createElement('div');
    typing.className = 'swc-typing';
    typing.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;

    busy = true;
    send.disabled = true;

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-12) }),
    })
      .then(function (r) {
        return r.json().then(
          function (data) { return { status: r.status, data: data }; },
          function () { return { status: r.status, data: null }; }
        );
      })
      .then(function (res) {
        typing.remove();
        if (res.data && res.data.reply) {
          addMsg('bot', res.data.reply);
          history.push({ role: 'assistant', content: res.data.reply });
          persist();
        } else {
          console.error('SWChat: サーバー応答エラー HTTP', res.status, '(/api/chat が正しくデプロイされているか、環境変数 GROQ_API_KEY を確認してください)');
          addMsg('bot', FALLBACK + '（メール：smartweb@nexia-works.jp）');
        }
      })
      .catch(function (err) {
        typing.remove();
        console.error('SWChat: 通信エラー', err);
        addMsg('bot', '通信エラーが発生しました。お手数ですが、ページ下部のお問い合わせフォームまたはメール（smartweb@nexia-works.jp）からご連絡ください。');
      })
      .finally(function () {
        busy = false;
        send.disabled = false;
        input.focus();
      });
  }

  send.addEventListener('click', submit);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.isComposing) submit();
  });

  /* ---------- open/close ---------- */
  var opened = false;
  function togglePanel() {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      placePanel();
      if (!opened) {
        opened = true;
        if (history.length === 0) {
          greet();
        } else {
          history.forEach(function (m) { addMsg(m.role === 'user' ? 'user' : 'bot', m.content); });
        }
      }
      input.focus();
    }
  }
  panel.querySelector('.swc-close').addEventListener('click', function () {
    panel.classList.remove('open');
  });
})();
