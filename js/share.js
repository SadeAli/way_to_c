/* ============================================================
   share.js — canvas-drawn share cards & the course certificate.
   Everything is generated client-side; nothing leaves the page
   until the user downloads/copies/shares it themselves.
   ============================================================ */
(function () {
  'use strict';

  const SITE_NAME = 'The C Path';
  function siteUrl() {
    return (location.origin && location.origin !== 'null' ? location.origin + location.pathname : 'thecpath')
      .replace(/index\.html$/, '').replace(/\/$/, '');
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  }

  /* ---------- 1200x630 share card ---------- */
  CT.drawShareCard = function (canvas, o) {
    canvas.width = 1200; canvas.height = 630;
    const ctx = canvas.getContext('2d');

    // ground
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, 1200, 630);
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, 'rgba(57,135,229,.22)');
    grad.addColorStop(.55, 'rgba(57,135,229,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 2;
    roundRect(ctx, 24, 24, 1152, 582, 26); ctx.stroke();

    // brand
    ctx.strokeStyle = '#3987e5'; ctx.lineWidth = 3;
    roundRect(ctx, 64, 58, 92, 54, 12); ctx.stroke();
    ctx.fillStyle = '#3987e5';
    ctx.font = '800 34px ui-monospace, Menlo, Consolas, monospace';
    ctx.fillText('<C>', 78, 96);
    ctx.fillStyle = '#c3c2b7';
    ctx.font = '600 30px system-ui, sans-serif';
    ctx.fillText(SITE_NAME, 176, 95);

    // emoji + title
    if (o.emoji) { ctx.font = '90px system-ui, sans-serif'; ctx.fillText(o.emoji, 64, 250); }
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 62px system-ui, sans-serif';
    ctx.fillText(o.title, o.emoji ? 180 : 64, 240, 950);
    if (o.subtitle) {
      ctx.fillStyle = '#c3c2b7';
      ctx.font = '400 32px system-ui, sans-serif';
      ctx.fillText(o.subtitle, 64, 316, 1070);
    }

    // stat tiles
    const stats = o.stats || [];
    const tw = Math.min(250, (1072 - (stats.length - 1) * 20) / Math.max(stats.length, 1));
    stats.forEach((s, i) => {
      const x = 64 + i * (tw + 20);
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      roundRect(ctx, x, 370, tw, 130, 16); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1.5;
      roundRect(ctx, x, 370, tw, 130, 16); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 44px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(s.v), x + tw / 2, 432, tw - 24);
      ctx.fillStyle = '#898781';
      ctx.font = '600 20px system-ui, sans-serif';
      ctx.fillText(s.k, x + tw / 2, 472, tw - 24);
      ctx.textAlign = 'left';
    });

    // footer
    ctx.fillStyle = '#3987e5';
    ctx.font = '700 26px ui-monospace, Menlo, monospace';
    ctx.fillText(siteUrl(), 64, 566);
    ctx.fillStyle = '#898781';
    ctx.font = '400 24px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('free · no signup · real GCC', 1136, 566);
    ctx.textAlign = 'left';
  };

  /* ---------- 1600x1131 certificate (A-series landscape) ---------- */
  CT.drawCertificate = function (canvas, o) {
    canvas.width = 1600; canvas.height = 1131;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, 1600, 1131);
    const grad = ctx.createRadialGradient(800, 380, 80, 800, 566, 900);
    grad.addColorStop(0, 'rgba(57,135,229,.16)');
    grad.addColorStop(1, 'rgba(57,135,229,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1600, 1131);

    // double border
    ctx.strokeStyle = '#3987e5'; ctx.lineWidth = 4;
    roundRect(ctx, 40, 40, 1520, 1051, 18); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1.5;
    roundRect(ctx, 58, 58, 1484, 1015, 12); ctx.stroke();

    ctx.textAlign = 'center';
    ctx.strokeStyle = '#3987e5'; ctx.lineWidth = 3.5;
    roundRect(ctx, 740, 108, 120, 68, 14); ctx.stroke();
    ctx.fillStyle = '#3987e5';
    ctx.font = '800 42px ui-monospace, Menlo, monospace';
    ctx.fillText('<C>', 800, 156);

    ctx.fillStyle = '#898781';
    ctx.font = '600 26px system-ui, sans-serif';
    ctx.fillText('THE C PATH · CERTIFICATE OF COMPLETION', 800, 240);

    ctx.fillStyle = '#c3c2b7';
    ctx.font = '400 30px system-ui, sans-serif';
    ctx.fillText('This certifies that', 800, 330);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 92px Georgia, serif';
    ctx.fillText(o.name || 'A Determined Learner', 800, 452, 1380);
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(360, 492); ctx.lineTo(1240, 492); ctx.stroke();

    ctx.fillStyle = '#c3c2b7';
    ctx.font = '400 31px system-ui, sans-serif';
    ctx.fillText('completed the entire course — all 9 parts and 73 interactive lessons —', 800, 572);
    ctx.fillText('from binary and bits through pointers, the preprocessor, the standard', 800, 620);
    ctx.fillText('library, algorithms, and the GCC toolchain, with every program', 800, 668);
    ctx.fillText('compiled and run on a real C compiler.', 800, 716);

    ctx.fillStyle = '#ffd700';
    ctx.font = '58px system-ui, sans-serif';
    ctx.fillText('👑', 800, 812);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 34px system-ui, sans-serif';
    ctx.fillText(`Grandmaster of C · ${o.xp.toLocaleString()} XP`, 800, 878);

    ctx.fillStyle = '#898781';
    ctx.font = '400 26px system-ui, sans-serif';
    ctx.fillText(o.date, 480, 990);
    ctx.fillText(siteUrl() || 'The C Path', 1120, 990);
    ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(360, 950); ctx.lineTo(600, 950); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1000, 950); ctx.lineTo(1240, 950); ctx.stroke();
    ctx.textAlign = 'left';
  };

  /* ---------- download / copy / share buttons for a canvas ---------- */
  CT.canvasActions = function (canvas, filename, shareText) {
    const bar = document.createElement('div');
    bar.className = 'share-actions';
    const dl = document.createElement('a');
    dl.className = 'btn primary'; dl.textContent = '⬇ Download PNG';
    dl.addEventListener('click', () => {
      canvas.toBlob(b => {
        dl.href = URL.createObjectURL(b);
        dl.download = filename;
        setTimeout(() => URL.revokeObjectURL(dl.href), 5000);
      });
    });
    // pre-arm href so the first click already downloads
    canvas.toBlob(b => { dl.href = URL.createObjectURL(b); dl.download = filename; });
    bar.appendChild(dl);

    if (navigator.clipboard && window.ClipboardItem) {
      const cp = document.createElement('button');
      cp.className = 'btn'; cp.textContent = '📋 Copy image';
      cp.addEventListener('click', () => {
        canvas.toBlob(b => {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': b })])
            .then(() => CT.toast('📋 Image copied — paste it anywhere', 'xp', 2600))
            .catch(() => CT.toast('⚠️ Copy failed — use Download instead', '', 3000));
        });
      });
      bar.appendChild(cp);
    }

    if (shareText) {
      const tw = document.createElement('a');
      tw.className = 'btn'; tw.textContent = '🐦 Share on X';
      tw.target = '_blank'; tw.rel = 'noopener';
      tw.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText + '\n' + siteUrl());
      bar.appendChild(tw);
      const li = document.createElement('a');
      li.className = 'btn'; li.textContent = '💼 LinkedIn';
      li.target = '_blank'; li.rel = 'noopener';
      li.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(siteUrl() || 'https://example.com');
      bar.appendChild(li);
      if (navigator.share) {
        const ns = document.createElement('button');
        ns.className = 'btn'; ns.textContent = '📤 Share…';
        ns.addEventListener('click', () => navigator.share({ text: shareText, url: siteUrl() }).catch(() => {}));
        bar.appendChild(ns);
      }
    }
    return bar;
  };

  CT.siteUrl = siteUrl;
})();
