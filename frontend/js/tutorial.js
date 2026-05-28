/* ============================================================
   CARROM TUTORIAL OVERLAY
   Add this <script> tag at the bottom of your HTML <body>,
   AFTER your existing game scripts.
   ============================================================ */

(function () {
  /* ── Styles ─────────────────────────────────────────────── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

    #tut-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(20, 10, 4, 0.82);
      display: flex; align-items: center; justify-content: center;
      padding: 20px; box-sizing: border-box;
    }
    #tut-panel {
      background: linear-gradient(160deg, #fdf3e1 0%, #f5ddb0 60%, #e8c68a 100%);
      border: 3px solid #7a4a1e;
      border-radius: 18px;
      box-shadow: 0 0 0 6px rgba(122,74,30,0.18), 0 8px 40px rgba(0,0,0,0.55);
      width: 100%; max-width: 680px;
      font-family: 'Crimson Text', Georgia, serif;
      color: #3d1e10;
      overflow: hidden;
    }
    #tut-header {
      background: linear-gradient(135deg, #4a2010 0%, #7a3a14 50%, #4a2010 100%);
      padding: 22px 28px 18px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 2px solid #c8801a;
    }
    #tut-header-left { display: flex; flex-direction: column; gap: 3px; }
    #tut-title {
      font-family: 'Cinzel', serif; font-size: 22px; font-weight: 700;
      color: #f5d78e; letter-spacing: 0.12em;
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
      margin: 0;
    }
    #tut-subtitle {
      font-family: 'Crimson Text', serif; font-style: italic;
      font-size: 13px; color: #c89050; letter-spacing: 0.05em;
    }
    #tut-close {
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%; width: 34px; height: 34px; cursor: pointer;
      color: #f5d78e; font-size: 18px; line-height: 1;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    #tut-close:hover { background: rgba(255,255,255,0.18); }

    #tut-nav {
      display: flex; gap: 0; border-bottom: 2px solid #c8801a;
      background: #4a2010;
    }
    .tut-tab {
      flex: 1; padding: 11px 8px; cursor: pointer;
      font-family: 'Cinzel', serif; font-size: 11px; font-weight: 600;
      letter-spacing: 0.08em; color: #b07840;
      border: none; background: none;
      border-right: 1px solid rgba(200,128,26,0.3);
      transition: all 0.15s; text-align: center;
    }
    .tut-tab:last-child { border-right: none; }
    .tut-tab:hover { background: rgba(245,215,142,0.08); color: #f5d78e; }
    .tut-tab.active {
      background: linear-gradient(180deg, #fdf3e1 0%, #f5ddb0 100%);
      color: #4a2010; border-bottom: 2px solid #fdf3e1; margin-bottom: -2px;
    }

    #tut-body { padding: 24px 28px 20px; min-height: 320px; }

    .tut-page { display: none; }
    .tut-page.active { display: block; }

    /* Controls page */
    .ctrl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
    .ctrl-card {
      background: rgba(122,74,30,0.08); border: 1px solid rgba(122,74,30,0.2);
      border-radius: 10px; padding: 14px 16px;
    }
    .ctrl-card-icon {
      width: 36px; height: 36px; border-radius: 8px;
      background: #7a3a14; display: flex; align-items: center; justify-content: center;
      margin-bottom: 10px; font-size: 17px; color: #f5d78e;
    }
    .ctrl-card-title { font-family: 'Cinzel', serif; font-size: 12px; font-weight: 600; color: #4a2010; margin-bottom: 5px; letter-spacing: 0.05em; }
    .ctrl-card-desc { font-size: 14px; color: #6b3d1d; line-height: 1.5; }
    .ctrl-tip {
      background: rgba(122,74,30,0.1); border-left: 3px solid #c8801a;
      border-radius: 0 8px 8px 0; padding: 10px 14px;
      font-style: italic; font-size: 14px; color: #6b3d1d;
    }

    /* Coins page */
    .coin-section-title { font-family: 'Cinzel', serif; font-size: 13px; font-weight: 600; color: #4a2010; letter-spacing: 0.07em; margin: 0 0 12px; }
    .coin-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .coin-row-item {
      display: flex; align-items: center; gap: 14px;
      background: rgba(122,74,30,0.07); border: 1px solid rgba(122,74,30,0.15);
      border-radius: 10px; padding: 12px 16px;
    }
    .coin-visual {
      width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; position: relative;
    }
    .coin-visual::after {
      content: ''; position: absolute;
      width: 60%; height: 60%; border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.18);
    }
    .coin-white { background: radial-gradient(circle at 35% 35%, #fff 0%, #ddd 100%); border: 2px solid #999; }
    .coin-black { background: radial-gradient(circle at 35% 35%, #555 0%, #111 100%); border: 2px solid #444; }
    .coin-red   { background: radial-gradient(circle at 35% 35%, #ff5533 0%, #cc1100 100%); border: 2px solid #991100; }
    .coin-info-wrap { flex: 1; }
    .coin-name { font-family: 'Cinzel', serif; font-size: 13px; font-weight: 600; color: #3d1e10; margin-bottom: 2px; }
    .coin-desc { font-size: 13px; color: #6b3d1d; line-height: 1.4; }
    .coin-pts {
      font-family: 'Cinzel', serif; font-size: 17px; font-weight: 700; color: #8b3a00;
      background: rgba(139,58,0,0.1); border-radius: 8px;
      padding: 4px 10px; flex-shrink: 0;
    }
    .queen-box {
      background: linear-gradient(135deg, rgba(200,128,26,0.12) 0%, rgba(200,128,26,0.06) 100%);
      border: 1px solid rgba(200,128,26,0.4); border-radius: 10px;
      padding: 14px 16px;
    }
    .queen-box-title { font-family: 'Cinzel', serif; font-size: 12px; font-weight: 700; color: #8b5a00; margin-bottom: 6px; letter-spacing: 0.06em; }
    .queen-box-desc { font-size: 14px; color: #6b3d1d; line-height: 1.55; }

    /* Rules page */
    .rule-block { margin-bottom: 18px; }
    .rule-block-title { font-family: 'Cinzel', serif; font-size: 12px; font-weight: 700; letter-spacing: 0.07em; margin-bottom: 8px; }
    .rule-title-foul { color: #a32000; }
    .rule-title-score { color: #3a6b00; }
    .rule-title-win   { color: #4a2010; }
    .penalty-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .penalty-card {
      background: rgba(163,32,0,0.07); border: 1px solid rgba(163,32,0,0.2);
      border-radius: 9px; padding: 11px 13px;
    }
    .penalty-title { font-size: 13px; font-weight: 600; color: #6b1000; margin-bottom: 3px; }
    .penalty-desc { font-size: 13px; color: #7a2010; line-height: 1.4; }
    .score-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 7px; }
    .score-list li {
      font-size: 14px; color: #3d1e10; line-height: 1.5;
      display: flex; gap: 8px; align-items: flex-start;
    }
    .score-list li::before { content: '♦'; color: #c8801a; flex-shrink: 0; font-size: 12px; margin-top: 2px; }
    .win-box {
      background: rgba(74,32,16,0.06); border: 1px solid rgba(74,32,16,0.2);
      border-radius: 10px; padding: 13px 16px; font-size: 14px; color: #4a2010; line-height: 1.6;
    }

    #tut-footer {
      padding: 14px 28px 20px; display: flex; align-items: center; justify-content: space-between;
      border-top: 1px solid rgba(122,74,30,0.25);
    }
    .tut-dots { display: flex; gap: 6px; }
    .tut-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: rgba(122,74,30,0.25); transition: background 0.2s;
    }
    .tut-dot.active { background: #7a3a14; }
    .tut-btn {
      padding: 9px 22px; border-radius: 8px; cursor: pointer;
      font-family: 'Cinzel', serif; font-size: 12px; font-weight: 600;
      letter-spacing: 0.06em; transition: all 0.15s;
    }
    #tut-prev {
      background: transparent; border: 1.5px solid rgba(122,74,30,0.4); color: #7a4a1e;
    }
    #tut-prev:hover { background: rgba(122,74,30,0.1); }
    #tut-next {
      background: linear-gradient(135deg, #7a3a14 0%, #a05020 100%);
      border: none; color: #f5d78e;
      box-shadow: 0 2px 8px rgba(122,58,20,0.4);
    }
    #tut-next:hover { background: linear-gradient(135deg, #9a4a1a 0%, #c06030 100%); }

    @media (max-width: 520px) {
      .ctrl-grid, .penalty-grid { grid-template-columns: 1fr; }
      #tut-panel { border-radius: 14px; }
      #tut-body { padding: 18px 18px 14px; }
      #tut-header { padding: 16px 18px 14px; }
      #tut-footer { padding: 12px 18px 16px; }
    }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── HTML ────────────────────────────────────────────────── */
  const html = `
  <div id="tut-overlay">
    <div id="tut-panel">

      <div id="tut-header">
        <div id="tut-header-left">
          <p id="tut-title">HOW TO PLAY</p>
          <span id="tut-subtitle">Carrom — 2 Player Edition</span>
        </div>
        <button id="tut-close" aria-label="Close tutorial">✕</button>
      </div>

      <div id="tut-nav">
        <button class="tut-tab active" data-page="0">CONTROLS</button>
        <button class="tut-tab" data-page="1">COINS</button>
        <button class="tut-tab" data-page="2">RULES</button>
      </div>

      <div id="tut-body">

        <!-- Page 0: Controls -->
        <div class="tut-page active" data-idx="0">
          <div class="ctrl-grid">
            <div class="ctrl-card">
              <div class="ctrl-card-icon">↔</div>
              <div class="ctrl-card-title">Position striker</div>
              <div class="ctrl-card-desc">Left-click and drag your striker left or right along the baseline.</div>
            </div>
            <div class="ctrl-card">
              <div class="ctrl-card-icon">⊕</div>
              <div class="ctrl-card-title">Enter aim mode</div>
              <div class="ctrl-card-desc">Right-click near your striker to toggle the aim arrow on or off.</div>
            </div>
            <div class="ctrl-card">
              <div class="ctrl-card-icon">◎</div>
              <div class="ctrl-card-title">Adjust aim</div>
              <div class="ctrl-card-desc">While aiming, move your mouse to change direction. Distance = power.</div>
            </div>
            <div class="ctrl-card">
              <div class="ctrl-card-icon">▶</div>
              <div class="ctrl-card-title">Fire</div>
              <div class="ctrl-card-desc">Left-click anywhere to shoot the striker in the aimed direction.</div>
            </div>
          </div>
          <div class="ctrl-tip">
            Player 1 shoots from the bottom. Player 2 shoots from the top. Pocket a coin to keep your turn.
          </div>
        </div>

        <!-- Page 1: Coins -->
        <div class="tut-page" data-idx="1">
          <div class="coin-section-title">PIECES ON THE BOARD</div>
          <div class="coin-list">
            <div class="coin-row-item">
              <div class="coin-visual coin-white"></div>
              <div class="coin-info-wrap">
                <div class="coin-name">White coin</div>
                <div class="coin-desc">9 on the board. Your primary scoring piece.</div>
              </div>
              <div class="coin-pts">+10</div>
            </div>
            <div class="coin-row-item">
              <div class="coin-visual coin-black"></div>
              <div class="coin-info-wrap">
                <div class="coin-name">Black coin</div>
                <div class="coin-desc">9 on the board. Slightly harder to pocket.</div>
              </div>
              <div class="coin-pts">+5</div>
            </div>
            <div class="coin-row-item">
              <div class="coin-visual coin-red"></div>
              <div class="coin-info-wrap">
                <div class="coin-name">Queen (red)</div>
                <div class="coin-desc">1 in the centre. Highest value — but must be covered.</div>
              </div>
              <div class="coin-pts">+25</div>
            </div>
          </div>
          <div class="queen-box">
            <div class="queen-box-title">♛ THE QUEEN RULE</div>
            <div class="queen-box-desc">After pocketing the red queen, you <strong>must pocket at least one more coin in the same shot</strong> (called a "cover"). If you don't, the queen returns to the centre and you lose 25 pts.</div>
          </div>
        </div>

        <!-- Page 2: Rules -->
        <div class="tut-page" data-idx="2">
          <div class="rule-block">
            <div class="rule-block-title rule-title-foul">FOULS &amp; PENALTIES</div>
            <div class="penalty-grid">
              <div class="penalty-card">
                <div class="penalty-title">Striker pocketed</div>
                <div class="penalty-desc">−5 pts. One of your pocketed coins is returned to the board.</div>
              </div>
              <div class="penalty-card">
                <div class="penalty-title">Queen not covered</div>
                <div class="penalty-desc">−25 pts. Queen goes back to the centre.</div>
              </div>
              <div class="penalty-card">
                <div class="penalty-title">Last coin before queen</div>
                <div class="penalty-desc">−5 pts if the last non-queen piece is pocketed while the queen remains.</div>
              </div>
              <div class="penalty-card">
                <div class="penalty-title">No coin pocketed</div>
                <div class="penalty-desc">No penalty, but your turn passes to the other player.</div>
              </div>
            </div>
          </div>

          <div class="rule-block">
            <div class="rule-block-title rule-title-score">KEEPING YOUR TURN</div>
            <ul class="score-list">
              <li>Pocket any coin (white, black, or queen + cover) to play again.</li>
              <li>A foul or a miss ends your turn immediately.</li>
              <li>If the striker is pocketed your turn ends even if you scored.</li>
            </ul>
          </div>

          <div class="rule-block">
            <div class="rule-block-title rule-title-win">WINNING</div>
            <div class="win-box">
              All coins pocketed? The game ends. The player with the higher score wins. Click <strong>Play Again</strong> on the game-over screen to restart at any time.
            </div>
          </div>
        </div>

      </div><!-- /tut-body -->

      <div id="tut-footer">
        <div class="tut-dots">
          <div class="tut-dot active"></div>
          <div class="tut-dot"></div>
          <div class="tut-dot"></div>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="tut-btn" id="tut-prev">← Prev</button>
          <button class="tut-btn" id="tut-next">Next →</button>
        </div>
      </div>

    </div>
  </div>`;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper.firstElementChild);

  /* ── Logic ───────────────────────────────────────────────── */
  const overlay = document.getElementById("tut-overlay");
  const pages = Array.from(document.querySelectorAll(".tut-page"));
  const tabs = Array.from(document.querySelectorAll(".tut-tab"));
  const dots = Array.from(document.querySelectorAll(".tut-dot"));
  const prevBtn = document.getElementById("tut-prev");
  const nextBtn = document.getElementById("tut-next");
  let current = 0;

  function goTo(idx) {
    pages[current].classList.remove("active");
    tabs[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = idx;
    pages[current].classList.add("active");
    tabs[current].classList.add("active");
    dots[current].classList.add("active");
    prevBtn.style.display = current === 0 ? "none" : "";
    nextBtn.textContent =
      current === pages.length - 1 ? "Start Playing ♟" : "Next →";
  }

  goTo(0);

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => goTo(+tab.dataset.page)),
  );

  prevBtn.addEventListener("click", () => {
    if (current > 0) goTo(current - 1);
  });
  nextBtn.addEventListener("click", () => {
    if (current < pages.length - 1) {
      goTo(current + 1);
    } else {
      overlay.remove();
    }
  });

  document
    .getElementById("tut-close")
    .addEventListener("click", () => overlay.remove());

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
})();
