"use strict";

// ===== The Battle Gatos: inicialização e loop principal =====

document.addEventListener("click", () => Sfx.init());
document.addEventListener("click", e => {
  if(e.target && e.target.tagName === "BUTTON") Sfx.click();
});

UI.bind();
const urlParams = new URLSearchParams(window.location.search);
if(urlParams.has("battle")){
  const stg = parseInt(urlParams.get("battle") || "1", 10);
  UI.show("battleScreen");
  UI.battle.start(isNaN(stg) ? 1 : stg, (res, idx) => {
    UI.show("map");
    UI.renderMap();
  });
} else {
  UI.show("title");
}

// ---------- animação do título ----------
const tcv = document.getElementById("titleCanvas");
const tg = tcv.getContext("2d");

function renderTitle(t){
  const W = tcv.width, H = tcv.height;
  tg.clearRect(0, 0, W, H);
  // gato gigante
  tg.save();
  tg.translate(W / 2, H * 0.85);
  const k = 2.4;
  tg.scale(k, k);
  Sprites.drawCat(tg, {
    def: CATS[0], side: "cat", x: 0, walk: 0,
    moving: false, attackT: 0, kbT: 0, flash: 0, phase: 1.2, isPortrait: true
  }, t);
  tg.restore();
  // peixinhos subindo
  tg.font = "18px serif";
  for(let i = 0; i < 5; i++){
    const fx = ((t * 26 + i * 85) % (W + 40)) - 20;
    tg.globalAlpha = 0.45 + Math.sin(t * 2 + i) * 0.3;
    tg.fillText("🐟", fx, 34 + Math.sin(t * 1.5 + i * 2) * 12);
  }
  tg.globalAlpha = 1;
}

// ---------- loop ----------
let last = performance.now();
function loop(now){
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;

  const battleVisible = !document.getElementById("battleScreen").classList.contains("hidden");
  if(battleVisible && UI.battle){
    UI.battle.update(dt * UI.battle.speed);
    UI.battle.render(t);
  }
  if(!document.getElementById("title").classList.contains("hidden")){
    renderTitle(t);
  }
}
requestAnimationFrame(loop);

// ---------- atalhos de teclado na batalha ----------
document.addEventListener("keydown", e => {
  const visible = !document.getElementById("battleScreen").classList.contains("hidden");
  if(!visible || !UI.battle) return;
  const b = UI.battle;
  if(/^Digit[1-9]$/.test(e.code)){
    const i = +e.code.slice(5) - 1;
    if(CATS[i]) b.trySpawn(CATS[i].id);
  } else if(e.code === "KeyW"){
    b.upgradeWallet();
  } else if(e.code === "Space"){
    e.preventDefault();
    b.fireCannon();
  } else if(e.code === "KeyP" || e.code === "Escape"){
    b.togglePause();
  }
});

// ---------- gancho de depuração/testes ----------
window.__bc = {
  get battle(){ return UI.battle; },
  save: () => Save.get(),
  addFish(n){ const s = Save.get(); s.fish += n; Save.write(s); UI.updateTopbar(); },
  addXp(n){ const s = Save.get(); s.xp += n; Save.write(s); UI.updateTopbar(); }
};
