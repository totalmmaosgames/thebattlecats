"use strict";

// ===== Motor de Batalha: The Battle Cats =====

class Battle {
  constructor(canvas){
    this.cv = canvas;
    this.g = canvas.getContext("2d");
    this.W = canvas.width;
    this.H = canvas.height;
    this.active = false;
    this.st = null;
    this.hudT = 0;
    this.activeRow = 0; // 0 = Gatos 1-5, 1 = Gatos 6-9

    this.initWorkerAndCannonCanvas();
    this.buildHud();
  }

  // Prepara os mini-canvas para os ícones circulares do Trabalhador e Canhão
  initWorkerAndCannonCanvas(){
    this.wCanvas = document.getElementById("bWorkerCanvas");
    this.cCanvas = document.getElementById("bCannonCanvas");
    if(this.wCanvas) this.wg = this.wCanvas.getContext("2d");
    if(this.cCanvas) this.cg = this.cCanvas.getContext("2d");
    this.drawWorkerFace();
    this.drawCannonIcon();
  }

  drawWorkerFace(){
    if(!this.wg) return;
    const g = this.wg;
    g.clearRect(0, 0, 70, 70);
    // Rostinho do Gato Trabalhador determinado (como visto na foto)
    g.save();
    g.translate(35, 38);
    // Cabeça redonda
    g.fillStyle = "#ffffff";
    g.strokeStyle = "#141414";
    g.lineWidth = 2.5;
    Sprites.circle(g, 0, 0, 22);
    g.fill(); g.stroke();
    // Orelhinhas pontudas
    g.beginPath(); g.moveTo(-16, -14); g.lineTo(-10, -28); g.lineTo(-3, -18); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(3, -18); g.lineTo(10, -28); g.lineTo(16, -14); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fecdd3";
    g.beginPath(); g.moveTo(-13, -15); g.lineTo(-10, -24); g.lineTo(-5, -18); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(5, -18); g.lineTo(10, -24); g.lineTo(13, -15); g.closePath(); g.fill();
    // Sobrancelhas franzidas / expressão de esforço
    g.fillStyle = "#141414";
    g.strokeStyle = "#141414";
    g.lineWidth = 2.2;
    g.beginPath();
    g.moveTo(-14, -6); g.lineTo(-5, -3);
    g.moveTo(5, -3); g.lineTo(14, -6);
    g.stroke();
    // Olhos semicerrados
    g.beginPath();
    g.moveTo(-13, -1); g.lineTo(-6, -1);
    g.moveTo(6, -1); g.lineTo(13, -1);
    g.stroke();
    // Boca com dentes cerrados
    g.fillStyle = "#ffffff";
    Sprites.rr(g, -8, 5, 16, 8, 2);
    g.fill(); g.stroke();
    g.beginPath();
    g.moveTo(0, 5); g.lineTo(0, 13);
    g.moveTo(-4, 5); g.lineTo(-4, 13);
    g.moveTo(4, 5); g.lineTo(4, 13);
    g.stroke();
    // Gotinha de suor na bochecha (estilo anime)
    g.fillStyle = "#38bdf8";
    g.beginPath();
    g.moveTo(16, -2);
    g.quadraticCurveTo(22, 4, 18, 7);
    g.quadraticCurveTo(14, 7, 14, 4);
    g.closePath();
    g.fill();
    g.restore();
  }

  drawCannonIcon(){
    if(!this.cg) return;
    const g = this.cg;
    g.clearRect(0, 0, 72, 72);
    // Ícone da cabeça do canhão da base
    g.save();
    g.translate(36, 40);
    // Cabeça do gato
    g.fillStyle = "#ffffff";
    g.strokeStyle = "#141414";
    g.lineWidth = 2.5;
    Sprites.circle(g, 0, 0, 20);
    g.fill(); g.stroke();
    // Orelhas
    g.beginPath(); g.moveTo(-14, -12); g.lineTo(-9, -25); g.lineTo(-2, -16); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(2, -16); g.lineTo(9, -25); g.lineTo(14, -12); g.closePath(); g.fill(); g.stroke();
    // Olhos
    g.fillStyle = "#141414";
    Sprites.circle(g, -8, -4, 2.5); g.fill();
    Sprites.circle(g, 8, -4, 2.5); g.fill();
    // Cano do canhão frontal
    g.fillStyle = "#64748b";
    Sprites.circle(g, 0, 7, 9);
    g.fill(); g.stroke();
    g.fillStyle = "#0f172a";
    Sprites.circle(g, 0, 7, 5);
    g.fill(); g.stroke();
    g.restore();
  }

  // ---------- HUD (DOM) ----------
  buildHud(){
    const units = document.getElementById("bUnits");
    units.innerHTML = "";
    this.unitBtns = [];

    // Cria as cartas no estilo The Battle Cats (fundo pergaminho e moldura comic)
    CATS.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "bc-card";
      b.dataset.cat = c.id;
      b.dataset.index = i;

      // Canvas para desenhar o retrato do gato
      const cv = document.createElement("canvas");
      cv.width = 110;
      cv.height = 110;
      cv.className = "bc-card-canvas";
      Sprites.drawPortrait(cv.getContext("2d"), 110, c, 1);

      b.innerHTML = `
        <div class="bc-card-inner">
          <span class="bc-card-key">${i + 1}</span>
          <div class="bc-card-art"></div>
          <div class="bc-card-cost">${c.cost}¢</div>
          <div class="bc-card-cool"></div>
          <div class="bc-card-cyan-bar"></div>
        </div>
      `;

      b.querySelector(".bc-card-art").appendChild(cv);
      b.addEventListener("click", () => { this.trySpawn(c.id); b.blur(); });
      units.appendChild(b);

      this.unitBtns.push({
        btn: b,
        cool: b.querySelector(".bc-card-cool"),
        cyan: b.querySelector(".bc-card-cyan-bar"),
        def: c,
        idx: i
      });
    });

    // Alternador de fila (Fila 1: Gatos 1-5 | Fila 2: Gatos 6-9)
    const rowBtn = document.getElementById("bRowToggle");
    if(rowBtn){
      rowBtn.addEventListener("click", () => {
        this.activeRow = this.activeRow === 0 ? 1 : 0;
        this.updateDeckVisibility();
        rowBtn.blur();
      });
    }

    // Botão do Trabalhador Gato (Worker Cat)
    const workerBtn = document.getElementById("bWorkerBtn");
    if(workerBtn){
      workerBtn.addEventListener("click", () => { this.upgradeWallet(); workerBtn.blur(); });
    }

    // Botão do Canhão Laser dos Gatos
    const cannonBtn = document.getElementById("bCannonBtn");
    if(cannonBtn){
      cannonBtn.addEventListener("click", () => { this.fireCannon(); cannonBtn.blur(); });
    }

    // Botões superiores
    document.getElementById("bPause").addEventListener("click", () => this.togglePause());
    document.getElementById("bUnpause").addEventListener("click", () => this.togglePause());
    document.getElementById("bSpeed").addEventListener("click", e => {
      this.speed = this.speed === 1 ? 2 : 1;
      document.getElementById("bSpeedVal").textContent = this.speed + "x";
    });
    document.getElementById("bQuit").addEventListener("click", () => {
      if(this.active && this.onEnd) this.onEnd(null, this.stageIdx);
      this.end(null);
    });

    this.updateDeckVisibility();
  }

  updateDeckVisibility(){
    const rowBtn = document.getElementById("bRowToggle");
    if(rowBtn){
      rowBtn.textContent = this.activeRow === 0 ? "▲ Fila 2 (6-9)" : "▼ Fila 1 (1-5)";
    }
    this.unitBtns.forEach(u => {
      const inRow = (this.activeRow === 0 && u.idx < 5) || (this.activeRow === 1 && u.idx >= 5);
      u.btn.style.display = inRow ? "flex" : "none";
    });
  }

  // ---------- Início de Fase ----------
  start(stageIdx, onEnd){
    const stage = STAGES[stageIdx];
    this.stageIdx = stageIdx;
    this.stage = stage;
    this.onEnd = onEnd;
    this.save = Save.get();

    this.st = {
      time: 0,
      money: START_MONEY,
      wallet: 1,
      cannonCharge: 0.5, // Inicia em 50% para carregar e testar o Gato Gigante rapidinho!
      laserT: 0,       // Duração do feixe de laser disparado
      cats: [],
      enemies: [],
      projs: [],
      fx: [],
      pops: [],
      cds: {},
      ruleN: stage.rules.map(() => 0),
      evFired: (stage.events || []).map(() => false),
      chp: PLAYER_BASE_HP,
      cmax: PLAYER_BASE_HP,
      ehp: stage.baseHp,
      emax: stage.baseHp,
      baseFlash: 0,
      cbaseFlash: 0,
      shake: 0,
      result: null
    };

    this.running = true;
    this.paused = false;
    this.speed = 1;
    this.active = true;
    this.activeRow = 0;
    this.updateDeckVisibility();

    document.getElementById("bSpeedVal").textContent = "1x";
    document.getElementById("pauseOverlay").classList.add("hidden");
    document.getElementById("result").classList.add("hidden");

    // Nome da fase no topo esquerdo (estilo autêntico: "China", "Coréia", etc.)
    const stageNameEl = document.getElementById("bStageName");
    if(stageNameEl) stageNameEl.textContent = stage.name;

    this.updateHud(true);
  }

  // ---------- Ações do Jogador ----------
  trySpawn(id){
    if(!this.running || this.paused) return;
    const def = CATS.find(c => c.id === id);
    if(!def || !this.save.cats.includes(id)) return;
    const st = this.st;
    if(st.money < def.cost) return;
    if((st.cds[id] || 0) > 0) return;
    if(st.cats.length >= MAX_FIELD) return;

    st.money -= def.cost;
    st.cds[id] = def.cd;
    const lvl = this.save.levels[id] || 1;
    const m = levelMult(lvl);

    // Gatos saem da BASE DIREITA (CAT_BASE_X) e caminham para a ESQUERDA
    const spawnX = CAT_BASE_X - 60 - Math.random() * 15;
    st.cats.push(this.makeFighter("cat", def, spawnX, def.hp * m, def.atk * m));

    // Efeito de poeira na saída
    this.puff(spawnX, GROUND_Y - 15, "#ffffff");
    Sfx.spawn();
    Sfx.mew();
    this.updateHud(true);
  }

  upgradeWallet(){
    if(!this.running || this.paused) return;
    const st = this.st;
    if(st.wallet >= WALLET.max) return;
    const cost = WALLET.cost(st.wallet);
    if(st.money < cost) return;

    st.money -= cost;
    st.wallet++;
    Sfx.workerUpgrade();
    Sfx.coin();
    this.updateHud(true);
  }

  fireCannon(){
    if(!this.running || this.paused || !this.st) return;
    const st = this.st;
    if(st.cannonCharge < 1.0) return;

    // Dispara o Canhão Laser dos Gatos!
    st.cannonCharge = 0;
    st.laserT = 0.55; // Duração do raio devastador
    st.shake = 16;
    Sfx.laser();

    // Causa dano e knockback em TODOS os inimigos em campo
    for(const enemy of st.enemies){
      if(enemy.hp <= 0) continue;
      this.damage(enemy, CANNON.dmg);
      // Empurra todos para trás (em direção à base inimiga na esquerda)
      enemy.x = Math.max(ENEMY_BASE_X + 25, enemy.x - CANNON.kbDist);
      enemy.kbT = 0.6;
      this.star(enemy.x, GROUND_Y - 45, 24, "#38bdf8");
    }

    // INVOCAR O GATO GIGANTE COLOSSAL DO CANHÃO! 👑🐱
    const megaFighter = this.makeFighter("cat", MEGA_CAT, CAT_BASE_X - 100, MEGA_CAT.hp, MEGA_CAT.atk);
    st.cats.push(megaFighter);

    // Efeitos visuais épicos de saída do canhão e aterrissagem
    this.puff(CAT_BASE_X - 50, GROUND_Y - 40, "#38bdf8");
    this.puff(CAT_BASE_X - 100, GROUND_Y - 20, "#ffffff");
    this.star(CAT_BASE_X - 100, GROUND_Y - 80, 45, "#facc15");

    st.pops.push({
      x: CAT_BASE_X - 100,
      y: GROUND_Y - 180,
      txt: "👑 GATO GIGANTE!",
      life: 2.5,
      color: "#facc15",
      big: true
    });

    Sfx.meow(false);
    this.updateHud(true);
  }

  togglePause(){
    if(!this.active || this.st.result) return;
    this.paused = !this.paused;
    document.getElementById("pauseOverlay").classList.toggle("hidden", !this.paused);
  }

  // ---------- Fábrica de Lutadores ----------
  makeFighter(side, def, x, hp, atk){
    return {
      side,
      def,
      type: def.catType || def.id || def.name,
      x,
      hp,
      maxHp: hp,
      atk,
      cd: 0.35,
      walk: Math.random() * 10,
      moving: false,
      attackT: 0,
      flash: 0,
      kbT: 0,
      kbHp: hp,
      phase: Math.random() * 7
    };
  }

  // ---------- Loop de Atualização ----------
  update(dt){
    if(!this.active || !this.running || this.paused || this.st.result) return;
    const st = this.st;
    const stage = this.stage;
    st.time += dt;

    // Economia do Trabalhador Gato
    st.money = Math.min(WALLET.cap(st.wallet), st.money + WALLET.income(st.wallet) * dt);

    // Carregamento do Canhão Laser
    if(st.cannonCharge < 1.0){
      const prev = st.cannonCharge;
      st.cannonCharge = Math.min(1.0, st.cannonCharge + dt / CANNON.chargeTime);
      if(prev < 1.0 && st.cannonCharge >= 1.0){
        Sfx.cannonReady();
      }
    }

    // Efeito do feixe laser
    if(st.laserT > 0) st.laserT -= dt;

    // Recargas das cartas
    for(const k in st.cds) st.cds[k] = Math.max(0, st.cds[k] - dt);

    // Spawn de inimigos da Base/Portal Esquerdo (regras periódicas)
    stage.rules.forEach((r, i) => {
      if(st.time >= r.t0 + st.ruleN[i] * r.every){
        if(st.enemies.length < MAX_FIELD + 4){
          st.ruleN[i]++;
          this.spawnEnemy(r.type);
        }
      }
    });

    // Eventos pontuais (Chefes: Urso, Gorila, etc.)
    (stage.events || []).forEach((ev, i) => {
      if(!st.evFired[i] && st.time >= ev.t){
        st.evFired[i] = true;
        this.spawnEnemy(ev.type);
        st.shake = 12;
        st.pops.push({
          x: ENEMY_BASE_X + 120,
          y: 220,
          txt: "⚠️ " + ENEMIES[ev.type].name + "!",
          life: 2.2,
          color: "#ef4444",
          big: true
        });
        Sfx.meow(true);
      }
    });

    // Atualização de lutadores
    for(const f of st.cats) this.updateFighter(f, dt);
    for(const f of st.enemies) this.updateFighter(f, dt);

    // Projéteis (Dragão/Pedra)
    for(let i = st.projs.length - 1; i >= 0; i--){
      const p = st.projs[i];
      p.x += p.vx * dt;
      p.t += dt;
      let hit = null;
      const foes = p.side === "cat" ? st.enemies : st.cats;
      for(const f of foes){
        if(f.hp <= 0) continue;
        if(Math.abs(f.x - p.x) < 28){ hit = f; break; }
      }
      if(hit){
        this.damage(hit, p.dmg);
        if(p.aoe){
          for(const f of foes){
            if(f !== hit && f.hp > 0 && Math.abs(f.x - hit.x) < p.aoe) this.damage(f, p.dmg * 0.6);
          }
        }
        this.star(p.x, p.y, 18, p.kind === "fire" ? "#f97316" : "#facc15");
        this.puff(p.x, p.y, p.kind === "fire" ? "#fb923c" : "#e5e7eb");
        st.projs.splice(i, 1);
      } else if(p.x < -60 || p.x > this.W + 60){
        st.projs.splice(i, 1);
      }
    }

    // Limpeza de mortos e recompensas
    for(let i = st.cats.length - 1; i >= 0; i--){
      const f = st.cats[i];
      if(f.hp <= 0){
        this.puff(f.x, GROUND_Y - 25, "#ffffff");
        this.hearts(f.x, GROUND_Y - 50);
        st.cats.splice(i, 1);
      }
    }
    for(let i = st.enemies.length - 1; i >= 0; i--){
      const f = st.enemies[i];
      if(f.hp <= 0){
        this.puff(f.x, GROUND_Y - 25, "#cbd5e1");
        st.money = Math.min(WALLET.cap(st.wallet), st.money + f.def.reward);
        st.pops.push({
          x: f.x,
          y: GROUND_Y - 70,
          txt: "+¢" + f.def.reward,
          life: 0.9,
          color: "#facc15"
        });
        Sfx.coin();
        st.enemies.splice(i, 1);
      }
    }

    // Efeitos visuais (estrelas, poeiras, popups)
    for(let i = st.fx.length - 1; i >= 0; i--){
      const e = st.fx[i];
      e.life -= dt;
      e.r += (e.vr || 50) * dt;
      if(e.kind === "heart") e.y -= 45 * dt;
      if(e.life <= 0) st.fx.splice(i, 1);
    }
    for(let i = st.pops.length - 1; i >= 0; i--){
      const p = st.pops[i];
      p.life -= dt;
      p.y -= 36 * dt;
      if(p.life <= 0) st.pops.splice(i, 1);
    }

    st.shake = Math.max(0, st.shake - dt * 14);
    st.baseFlash = Math.max(0, st.baseFlash - dt);
    st.cbaseFlash = Math.max(0, st.cbaseFlash - dt);

    // Fim de Batalha (Vitória ou Derrota)
    if(st.ehp <= 0) this.end(true);
    else if(st.chp <= 0) this.end(false);

    // Atualização de HUD
    this.hudT += dt;
    if(this.hudT > 0.08){
      this.hudT = 0;
      this.updateHud(false);
    }
  }

  spawnEnemy(type){
    const d = ENEMIES[type];
    const mul = this.stage.mul;
    // Inimigos saem da BASE ESQUERDA (ENEMY_BASE_X) e marcham para a DIREITA
    const spawnX = ENEMY_BASE_X + 50 + Math.random() * 20;
    const enemyFighter = this.makeFighter("enemy", d, spawnX, d.hp * mul, d.atk * mul);
    enemyFighter.type = type;
    this.st.enemies.push(enemyFighter);
  }

  // ---------- IA e Combate de Cada Lutador ----------
  updateFighter(f, dt){
    const st = this.st;

    // Gatos andam para a ESQUERDA (dir = -1) e não passam da base inimiga
    // Inimigos andam para a DIREITA (dir = 1) e não passam da base dos gatos
    if(f.side === "cat"){
      f.x = Math.max(f.x, ENEMY_BASE_X + 22);
    } else {
      f.x = Math.min(f.x, CAT_BASE_X - 22);
    }

    if(f.kbT > 0){
      f.kbT -= dt;
      f.moving = false;
      return;
    }
    if(f.attackT > 0) f.attackT -= dt;
    if(f.flash > 0) f.flash -= dt;
    f.cd -= dt;

    const foes = f.side === "cat" ? st.enemies : st.cats;
    const dir = f.side === "cat" ? -1 : 1;
    const targetBaseX = f.side === "cat" ? ENEMY_BASE_X : CAT_BASE_X;

    // Localiza o oponente mais próximo à frente
    let target = null;
    let bestDist = Infinity;
    for(const o of foes){
      if(o.hp <= 0) continue;
      const d = (o.x - f.x) * dir; // Distância positiva = à frente
      if(d >= -20 && d < bestDist){
        bestDist = d;
        target = o;
      }
    }

    // Se não há lutador à frente, marcha em direção à base inimiga
    if(!target){
      const dBase = (targetBaseX - f.x) * dir;
      if(dBase > f.def.range + 8){
        f.x += f.def.spd * dir * dt;
        f.moving = true;
        f.walk += dt;
      } else {
        f.moving = false;
        if(f.cd <= 0) this.attackBase(f);
      }
      return;
    }

    // Se oponente está no alcance de ataque: golpeia
    if(bestDist <= f.def.range){
      f.moving = false;
      if(f.cd <= 0) this.attack(f, target, dir);
    } else {
      f.x += f.def.spd * dir * dt;
      f.moving = true;
      f.walk += dt;
    }
  }

  attack(f, target, dir){
    const st = this.st;
    f.cd = f.def.aspd;
    f.attackT = 0.25;
    Sfx.thud();

    if(f.def.ranged && f.def.ranged !== "kick"){
      const kind = f.def.ranged;
      st.projs.push({
        x: f.x + 20 * dir,
        y: GROUND_Y - 45,
        vx: (kind === "fire" ? 380 : 260) * dir,
        dmg: f.atk,
        side: f.side,
        kind,
        aoe: kind === "fire" ? 65 : 0,
        t: 0
      });
    } else if(f.def.aoe){
      // Ataque em área (ex: Titã)
      const foes = f.side === "cat" ? st.enemies : st.cats;
      let hitCount = 0;
      for(const o of foes){
        const d = (o.x - f.x) * dir;
        if(o.hp > 0 && d >= -25 && d <= f.def.aoe){
          this.damage(o, f.atk);
          this.star(o.x, GROUND_Y - 45, 20, "#fde047");
          hitCount++;
        }
      }
      if(hitCount > 0){
        st.shake = Math.max(st.shake, 6);
        this.puff(f.x + 30 * dir, GROUND_Y - 10, "#d1d5db");
      }
    } else {
      // Ataque corpo a corpo direto
      this.damage(target, f.atk);
      this.star(target.x, GROUND_Y - 40, 16, "#ffea31");
    }
  }

  attackBase(f){
    const st = this.st;
    f.cd = f.def.aspd;
    f.attackT = 0.25;
    Sfx.thud();

    if(f.side === "cat"){
      // Gato atacando a base inimiga (esquerda)
      st.ehp -= f.atk;
      st.baseFlash = 0.18;
      st.shake = Math.max(st.shake, 2.5);
      this.star(ENEMY_BASE_X + 45, GROUND_Y - 60, 24, "#facc15");
      st.pops.push({
        x: ENEMY_BASE_X + 45 + Math.random() * 30,
        y: GROUND_Y - 110 - Math.random() * 40,
        txt: "-" + Math.round(f.atk),
        life: 0.8,
        color: "#facc15",
        big: true
      });
    } else {
      // Inimigo atacando a base dos gatos (direita)
      st.chp -= f.atk;
      st.cbaseFlash = 0.18;
      st.shake = Math.max(st.shake, 5);
      Sfx.baseHit();
      this.star(CAT_BASE_X - 45, GROUND_Y - 60, 24, "#ef4444");
      st.pops.push({
        x: CAT_BASE_X - 45 - Math.random() * 30,
        y: GROUND_Y - 110 - Math.random() * 40,
        txt: "-" + Math.round(f.atk),
        life: 0.8,
        color: "#ef4444",
        big: true
      });
    }
  }

  damage(f, amount){
    const st = this.st;
    f.hp -= amount;
    f.flash = 0.25;

    st.pops.push({
      x: f.x + (Math.random() * 16 - 8),
      y: GROUND_Y - 65,
      txt: Math.round(amount),
      life: 0.55,
      color: "#ffffff"
    });

    // Knockback autêntico a cada 25% de vida perdida
    if(f.hp > 0 && f.hp <= f.kbHp - f.maxHp / 4){
      f.kbHp = f.hp;
      f.kbT = 0.45;
      // Gatos são arremessados para a DIREITA; Inimigos para a ESQUERDA
      f.x += f.side === "cat" ? 75 : -75;
      this.star(f.x, GROUND_Y - 80, 20, "#fde047");
      st.pops.push({ x: f.x, y: GROUND_Y - 95, txt: "!", life: 0.5, color: "#facc15", big: true });
      Sfx.kb();
    }
  }

  star(x, y, r, color){
    this.st.fx.push({ kind: "star", x, y, r, vr: 20, life: 0.35, color });
  }

  puff(x, y, color){
    this.st.fx.push({ kind: "puff", x, y, r: 12, vr: 60, life: 0.4, color });
  }

  hearts(x, y){
    for(let i = 0; i < 3; i++){
      this.st.fx.push({
        kind: "heart",
        x: x + (Math.random() * 24 - 12),
        y: y + Math.random() * 12,
        r: 4,
        life: 0.8,
        color: "#fb7185",
        dx: (Math.random() - 0.5) * 20
      });
    }
  }

  // ---------- Fim de Batalha ----------
  end(result){
    if(!this.active) return;
    this.running = false;
    this.active = false;
    this.st.result = result;
    if(result !== null) this.onEnd(result, this.stageIdx);
  }

  // ---------- Atualização de HUD ----------
  updateHud(force){
    const st = this.st;
    if(!st) return;

    // Dinheiro no topo direito no formato estilizado da foto (ex: 743 / 2010¢)
    const moneyValEl = document.getElementById("bMoneyVal");
    const moneyCapEl = document.getElementById("bMoneyCap");
    if(moneyValEl) moneyValEl.textContent = Math.floor(st.money);
    if(moneyCapEl) moneyCapEl.textContent = WALLET.cap(st.wallet);

    // Botão do Trabalhador Gato
    const wLvlTxt = document.getElementById("bWorkerLvlTxt");
    const wCostTxt = document.getElementById("bWorkerCostTxt");
    const wBtn = document.getElementById("bWorkerBtn");

    if(wLvlTxt) wLvlTxt.textContent = "Level " + st.wallet;
    if(wCostTxt){
      if(st.wallet >= WALLET.max){
        wCostTxt.textContent = "MÁX";
      } else {
        const cost = WALLET.cost(st.wallet);
        wCostTxt.textContent = cost + "¢";
        if(wBtn) wBtn.disabled = st.money < cost;
      }
    }

    // Botão do Canhão Laser dos Gatos
    const cBtn = document.getElementById("bCannonBtn");
    const cStatusTxt = document.getElementById("bCannonStatusTxt");
    const cRing = document.querySelector(".bc-cannon-circle");

    if(cRing){
      const circumference = 2 * Math.PI * 34; // r=34
      const offset = circumference * (1 - st.cannonCharge);
      cRing.style.strokeDasharray = `${circumference}`;
      cRing.style.strokeDashoffset = `${offset}`;
    }

    if(cBtn){
      const isCharged = st.cannonCharge >= 1.0;
      cBtn.disabled = !isCharged;
      cBtn.classList.toggle("ready", isCharged);
      if(cStatusTxt){
        cStatusTxt.textContent = isCharged ? "DISPARAR!" : Math.round(st.cannonCharge * 100) + "%";
        cStatusTxt.classList.toggle("ready-text", isCharged);
      }
    }

    // Cartas dos Gatos no tabuleiro
    for(const u of this.unitBtns){
      const owned = this.save.cats.includes(u.def.id);
      const cd = st.cds[u.def.id] || 0;
      const afford = st.money >= u.def.cost;

      // Overlay escuro de recarga + barra ciano autêntica (como na foto)
      const cdRatio = u.def.cd > 0 ? cd / u.def.cd : 0;
      u.cool.style.height = owned ? Math.round(cdRatio * 100) + "%" : "100%";
      u.cyan.style.width = cdRatio > 0 ? Math.round((1 - cdRatio) * 100) + "%" : "0%";
      u.btn.classList.toggle("off", !owned || !afford || cd > 0);
    }
  }

  // ---------- Renderização Gráfica do Campo de Batalha ----------
  render(t){
    const g = this.g, st = this.st;
    if(!st) return;
    const W = this.W, H = this.H;

    g.save();
    // Trepidação da tela em impactos fortes
    if(st.shake > 0){
      g.translate((Math.random() - 0.5) * st.shake, (Math.random() - 0.5) * st.shake);
    }

    // 1. Cenário e céu anime autêntico
    Sprites.drawBackground(g, W, H, this.stage.ch, t);

    // 2. Base Inimiga e Vórtice Negro (à esquerda)
    Sprites.drawEnemyBase(g, st.ehp / st.emax, st.ehp, st.emax, t, this.stage.ch);

    // 3. Base dos Gatos com Canhão e Radar (à direita)
    Sprites.drawCatBase(g, st.chp / st.cmax, t, st.laserT > 0);

    // 4. Feixe Devastador do Canhão Laser dos Gatos
    if(st.laserT > 0){
      Sprites.drawLaserBeam(g, CAT_BASE_X - 35, t, st.laserT / 0.55);
    }

    // Flashes brancos de impacto nas bases
    if(st.baseFlash > 0){
      g.globalAlpha = Math.min(0.5, st.baseFlash * 3);
      g.fillStyle = "#ffffff";
      g.fillRect(ENEMY_BASE_X - 60, GROUND_Y - 140, 120, 140);
      g.globalAlpha = 1;
    }
    if(st.cbaseFlash > 0){
      g.globalAlpha = Math.min(0.5, st.cbaseFlash * 3);
      g.fillStyle = "#fee2e2";
      g.fillRect(CAT_BASE_X - 60, GROUND_Y - 180, 120, 180);
      g.globalAlpha = 1;
    }

    // 5. Lutadores: Inimigos primeiro, Gatos por cima
    const drawF = f => {
      g.save();
      g.translate(f.x, GROUND_Y);
      if(f.side === "enemy") Sprites.drawEnemy(g, f, t);
      else Sprites.drawCat(g, f, t);
      g.restore();

      // Barrinha de vida compacta sobre a cabeça do lutador
      const bw = 36 * (f.def.s || 1.0);
      const ratio = Math.max(0, f.hp / f.maxHp);
      const bx = f.x - bw / 2;
      const by = GROUND_Y - 65 * (f.def.s || 1.0) - (f.def.fly ? 45 : 0);
      g.fillStyle = "rgba(0,0,0,0.6)";
      g.fillRect(bx - 1, by - 1, bw + 2, 5);
      g.fillStyle = f.side === "cat" ? "#22c55e" : "#ef4444";
      g.fillRect(bx, by, bw * ratio, 3);
    };

    for(const f of st.enemies) drawF(f);
    for(const f of st.cats) drawF(f);

    // 6. Projéteis
    for(const p of st.projs){
      const arcY = p.y - Math.sin(Math.min(1, p.t * 2) * Math.PI) * (p.kind === "rock" ? 28 : 8);
      if(p.kind === "fire"){
        g.fillStyle = "#f97316";
        Sprites.circle(g, p.x, arcY, 9); g.fill();
        g.fillStyle = "#facc15";
        Sprites.circle(g, p.x - Math.sign(p.vx) * 8, arcY, 5); g.fill();
      } else {
        g.fillStyle = "#a8a29e";
        Sprites.circle(g, p.x, arcY, 7); g.fill();
        g.strokeStyle = "#141414"; g.stroke();
      }
    }

    // 7. Efeitos Visuais (Estrelas de impacto comic, poeiras e corações)
    for(const e of st.fx){
      g.globalAlpha = Math.max(0, e.life * 2.2);
      if(e.kind === "star"){
        Sprites.drawHitStar(g, e.x, e.y, e.r, 6, e.color);
      } else if(e.kind === "puff"){
        Sprites.drawDustPuff(g, e.x, e.y, e.r, e.color);
      } else if(e.kind === "heart"){
        g.fillStyle = e.color;
        g.font = "bold 15px 'Trebuchet MS', sans-serif";
        g.fillText("🐾", e.x + e.dx * (1 - e.life), e.y);
      }
      g.globalAlpha = 1;
    }

    // 8. Números Flutuantes de Dano em tipografia arcade
    g.textAlign = "center";
    for(const p of st.pops){
      g.globalAlpha = Math.min(1, p.life * 2.5);
      g.font = p.big
        ? "900 24px 'Titan One', 'Outfit', sans-serif"
        : "900 16px 'Titan One', 'Outfit', sans-serif";
      g.strokeStyle = "#000000";
      g.lineWidth = 3.5;
      g.strokeText(p.txt, p.x, p.y);
      g.fillStyle = p.color;
      g.fillText(p.txt, p.x, p.y);
      g.globalAlpha = 1;
    }
    g.textAlign = "left";

    g.restore();
  }
}
