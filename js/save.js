"use strict";

// ===== Save do progresso (localStorage) =====

const Save = (() => {
  const KEY = "battlegatos:save";

  // Lista com todos os 9 gatos do jogo
  const ALL_CATS = () => CATS.map(c => c.id);

  const DEFAULT = () => ({
    fish: 5000,
    xp: 5000,
    unlocked: STAGES.length,                                             // todas as fases liberadas para teste
    cleared: {},
    levels: CATS.reduce((acc, c) => { acc[c.id] = 1; return acc; }, {}), // nível de cada gato
    cats: ALL_CATS()                                                     // todos os 9 gatos desbloqueados por padrão!
  });

  function read(){
    try{
      const raw = JSON.parse(localStorage.getItem(KEY));
      const def = DEFAULT();
      if(!raw) return def;

      // Garante que todos os 9 gatos estejam desbloqueados no save atual do jogador
      const all = ALL_CATS();
      const mergedCats = Array.from(new Set([...(Array.isArray(raw.cats) ? raw.cats : []), ...all]));
      const levels = Object.assign(def.levels, raw.levels || {});

      return {
        fish: typeof raw.fish === "number" ? Math.max(raw.fish, 2000) : 5000,
        xp: typeof raw.xp === "number" ? Math.max(raw.xp, 2000) : 5000,
        unlocked: Math.min(STAGES.length, Math.max(1, raw.unlocked || STAGES.length)),
        cleared: raw.cleared || {},
        levels,
        cats: mergedCats
      };
    }catch(e){ return DEFAULT(); }
  }

  return {
    get(){ return read(); },
    write(data){
      try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){}
    },
    reset(){
      try{ localStorage.removeItem(KEY); }catch(e){}
    },
    // aplica recompensas de vitória
    applyRewards(stageIdx, win){
      const s = read();
      if(win){
        const first = !s.cleared[stageIdx];
        const r = stageRewards(stageIdx, first);
        s.fish += r.fish;
        s.xp += r.xp;
        s.cleared[stageIdx] = true;
        s.unlocked = Math.min(STAGES.length, Math.max(s.unlocked, stageIdx + 2));
        this.write(s);
        return r;
      }
      return null;
    },
    unlockCat(id){
      const s = read();
      const def = CATS.find(c => c.id === id);
      if(!def || s.cats.includes(id) || s.fish < def.unlock) return false;
      s.fish -= def.unlock;
      s.cats.push(id);
      s.levels[id] = 1;
      this.write(s);
      return true;
    },
    upgradeCat(id){
      const s = read();
      const lvl = s.levels[id] || 1;
      const cost = upgradeCost(lvl);
      if(lvl >= MAX_LEVEL || s.xp < cost) return false;
      s.xp -= cost;
      s.levels[id] = lvl + 1;
      this.write(s);
      return true;
    }
  };
})();
