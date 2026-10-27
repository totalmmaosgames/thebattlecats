"use strict";

// ===== Telas: título, mapa, exército e fluxo de batalha =====

const UI = (() => {
  const $ = id => document.getElementById(id);
  let battle = null;
  let currentStage = 0;

  function show(name){
    ["title", "map", "army", "battleScreen"].forEach(n => $(n).classList.toggle("hidden", n !== name));
    $("topbar").classList.toggle("hidden", !(name === "map" || name === "army"));
  }

  function updateTopbar(){
    const s = Save.get();
    $("resFish").textContent = s.fish;
    $("resXp").textContent = s.xp;
  }

  // ---------- mapa de fases ----------
  function renderMap(){
    const s = Save.get();
    const wrap = $("stageMap");
    wrap.innerHTML = "";
    CHAPTERS.forEach((ch, ci) => {
      const div = document.createElement("div");
      div.className = "chapter";
      const h = document.createElement("h3");
      h.textContent = ch.name;
      div.appendChild(h);
      const row = document.createElement("div");
      row.className = "stages";
      STAGES.forEach((st, i) => {
        if(st.ch !== ci) return;
        const btn = document.createElement("button");
        const isBoss = st.events && st.events.length > 0;
        const cleared = !!s.cleared[i];
        const unlocked = i < s.unlocked;
        btn.className = "snode" + (isBoss ? " boss" : "") + (cleared ? " cleared" : "") + (!unlocked ? " locked" : "");
        btn.dataset.stage = i;
        btn.innerHTML =
          '<div class="snum">Fase ' + (i + 1) + (isBoss ? " · CHEFE" : "") + "</div>" +
          '<div class="sname">' + st.name + "</div>" +
          '<div class="sstate">' + (cleared ? "⭐ vencida" : unlocked ? "▶ jogar" : "🔒 bloqueada") + "</div>";
        if(unlocked){
          btn.addEventListener("click", () => { Sfx.click(); startStage(i); });
        }
        row.appendChild(btn);
      });
      div.appendChild(row);
      wrap.appendChild(div);
    });
    updateTopbar();
  }

  // ---------- exército ----------
  function renderArmy(){
    const s = Save.get();
    const grid = $("armyGrid");
    grid.innerHTML = "";
    CATS.forEach(def => {
      const owned = s.cats.includes(def.id);
      const lvl = s.levels[def.id] || 1;
      const m = levelMult(lvl);
      const card = document.createElement("div");
      card.className = "acard" + (owned ? "" : " lockedCat");

      const cv = document.createElement("canvas");
      cv.width = 72; cv.height = 72;
      Sprites.drawPortrait(cv.getContext("2d"), 72, def, 1);
      card.appendChild(cv);

      const info = document.createElement("div");
      info.className = "ainfo";
      if(owned){
        const tags = [
          def.ranged ? "🎯 longo alcance" : "",
          def.aoe ? "💥 área" : "",
          def.turbo ? "💨 veloz" : "",
          def.fat ? "🛡️ tanque" : "",
          def.axe ? "🪓 dano alto" : ""
        ].filter(Boolean).join(" · ");
        info.innerHTML =
          "<b>" + def.emoji + " " + def.name + "</b>" +
          '<span class="lvl">Nível ' + lvl + "/" + MAX_LEVEL + "</span>" +
          "<span>❤️ " + Math.round(def.hp * m) + " · ⚔️ " + Math.round(def.atk * m) + (tags ? " · " + tags : "") + "</span>" +
          "<span>Custo 🐟 " + def.cost + " · recarga " + def.cd + "s</span>";
      } else {
        info.innerHTML =
          "<b>" + def.emoji + " " + def.name + "</b>" +
          "<span>???</span>" +
          "<span>Desbloqueie por 🐟 " + def.unlock + "</span>";
      }
      card.appendChild(info);

      const btns = document.createElement("div");
      btns.className = "abtns";
      if(!owned){
        const ub = document.createElement("button");
        ub.className = "primary";
        ub.textContent = "🔓 " + def.unlock + " 🐟";
        ub.disabled = s.fish < def.unlock;
        ub.addEventListener("click", () => {
          if(Save.unlockCat(def.id)){ Sfx.jingle(true); renderArmy(); }
        });
        btns.appendChild(ub);
      } else if(lvl < MAX_LEVEL){
        const cost = upgradeCost(lvl);
        const ub = document.createElement("button");
        ub.textContent = "⬆️ Nv " + (lvl + 1) + " · " + cost + " ✨";
        ub.disabled = s.xp < cost;
        ub.addEventListener("click", () => {
          if(Save.upgradeCat(def.id)){ Sfx.coin(); renderArmy(); }
        });
        btns.appendChild(ub);
      } else {
        const max = document.createElement("button");
        max.textContent = "⭐ MÁX";
        max.disabled = true;
        btns.appendChild(max);
      }
      card.appendChild(btns);
      grid.appendChild(card);
    });
    updateTopbar();
  }

  // ---------- batalha ----------
  function startStage(i){
    currentStage = i;
    show("battleScreen");
    battle.start(i, onBattleEnd);
  }

  function onBattleEnd(result, stageIdx){
    updateTopbar();
    if(result === null){ // abandonou
      show("map");
      renderMap();
      return;
    }
    if(result){
      const r = Save.applyRewards(stageIdx, true);
      Sfx.jingle(true);
      $("resTitle").textContent = "⭐ Vitória!";
      $("resRewards").textContent = "+ 🐟 " + r.fish + "   ·   + ✨ " + r.xp;
      $("resNext").style.display = stageIdx + 1 < STAGES.length ? "" : "none";
    } else {
      Sfx.jingle(false);
      $("resTitle").textContent = "😿 Derrota…";
      $("resRewards").textContent = "Melhore seus gatos no Exército e tente de novo!";
      $("resNext").style.display = "none";
    }
    $("result").classList.remove("hidden");
  }

  // ---------- eventos ----------
  function bind(){
    battle = new Battle(document.getElementById("bCanvas"));

    $("btnPlay").addEventListener("click", () => { renderMap(); show("map"); });
    $("btnArmy").addEventListener("click", () => { renderArmy(); show("army"); });
    $("btnMapArmy").addEventListener("click", () => { renderArmy(); show("army"); });
    $("btnMapBack").addEventListener("click", () => show("title"));
    $("btnArmyBack").addEventListener("click", () => { renderMap(); show("map"); });

    // apagar progresso (confirmação dupla)
    let armed = false, timer = null;
    const rb = $("btnReset");
    rb.addEventListener("click", () => {
      if(!armed){
        armed = true;
        rb.textContent = "apagar MESMO? (clique de novo)";
        timer = setTimeout(() => { armed = false; rb.textContent = "apagar progresso"; }, 2500);
      } else {
        clearTimeout(timer);
        Save.reset();
        armed = false;
        rb.textContent = "apagar progresso";
        updateTopbar();
      }
    });

    $("resRetry").addEventListener("click", () => {
      $("result").classList.add("hidden");
      battle.start(currentStage, onBattleEnd);
    });
    $("resNext").addEventListener("click", () => {
      $("result").classList.add("hidden");
      currentStage++;
      battle.start(currentStage, onBattleEnd);
    });
    $("resMap").addEventListener("click", () => { show("map"); renderMap(); });
  }

  return {
    show, renderMap, renderArmy, updateTopbar, bind,
    get battle(){ return battle; }
  };
})();
