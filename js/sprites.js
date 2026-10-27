"use strict";

// ===== Sprites Procedurais Autênticos: The Battle Cats =====

const Sprites = (() => {

  // Auxiliares de desenho geométrico
  function rr(g, x, y, w, h, r){
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function circle(g, x, y, r){
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
  }

  function shadow(g, x, w){
    g.save();
    g.fillStyle = "rgba(0, 0, 0, 0.22)";
    g.beginPath();
    g.ellipse(x, 4, w, 7, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  // Estrela de impacto comic (estilo The Battle Cats)
  function drawHitStar(g, x, y, r, points = 6, color = "#ffea31"){
    g.save();
    g.translate(x, y);
    g.fillStyle = color;
    g.strokeStyle = "#1a1a1a";
    g.lineWidth = 2;
    g.beginPath();
    for(let i = 0; i < points * 2; i++){
      const angle = (i * Math.PI) / points;
      const rad = i % 2 === 0 ? r : r * 0.45;
      const px = Math.cos(angle) * rad;
      const py = Math.sin(angle) * rad;
      if(i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
  }

  // Nuvem de poeira comic
  function drawDustPuff(g, x, y, r, color = "#e8e5db"){
    g.save();
    g.fillStyle = color;
    g.strokeStyle = "#4a453d";
    g.lineWidth = 1.5;
    g.beginPath();
    circle(g, x, y, r);
    circle(g, x - r * 0.6, y + r * 0.2, r * 0.7);
    circle(g, x + r * 0.6, y + r * 0.2, r * 0.7);
    g.fill();
    g.stroke();
    g.restore();
  }

  // ---------------- GATOS (Unidades do Jogador) ----------------
  // Gatos olham naturalmente para a ESQUERDA (em direção ao inimigo na batalha)
  function drawCat(g, f, t){
    const d = f.def;
    const s = d.s || 1.0;
    const isPortrait = f.isPortrait;

    g.save();
    if(!isPortrait) shadow(g, 0, 24 * s);

    // Na batalha, gatos andam para a esquerda (scale = 1). No retrato/espelho se necessário.
    if(f.side === "enemy") g.scale(-1, 1);

    // Animação de ataque (avanço brusco em direção ao alvo)
    const lunge = f.attackT > 0 ? Math.sin((f.attackT / 0.25) * Math.PI) * 12 * s : 0;
    g.translate(-lunge, 0);

    // Knockback (arremessado para trás com rotação)
    if(f.kbT > 0){
      g.rotate(0.35);
      g.translate(14, -8);
    }

    const bob = f.moving ? Math.abs(Math.sin(f.walk * 10)) * 3 * s : 0;
    const walkStep = f.moving ? Math.sin(f.walk * 10) : 0;

    g.lineWidth = 2.5;
    g.strokeStyle = "#141414";
    g.fillStyle = "#ffffff";

    // 0. GATO GIGANTE LENDÁRIO (Invocado pelo Canhão!)
    if(d.catType === "mega"){
      const r = 26 * s;
      const cy = -r - 10 * s - bob;

      // Aura dourada brilhante pulsante ao redor
      g.save();
      g.strokeStyle = "rgba(250, 204, 21, " + (0.45 + Math.sin(t * 8) * 0.3) + ")";
      g.lineWidth = 5 * s;
      circle(g, 0, cy, r + 7 * s);
      g.stroke();
      g.restore();

      // Patas gigantes pesadas
      g.fillStyle = "#ffffff";
      g.fillRect(-r * 0.45 + walkStep * 4, -12 * s, 10 * s, 12 * s);
      g.strokeRect(-r * 0.45 + walkStep * 4, -12 * s, 10 * s, 12 * s);
      g.fillRect(r * 0.1 - walkStep * 4, -12 * s, 10 * s, 12 * s);
      g.strokeRect(r * 0.1 - walkStep * 4, -12 * s, 10 * s, 12 * s);

      // Corpo colossal branco maciço
      circle(g, 0, cy, r);
      g.fill(); g.stroke();

      // Orelhas pontudas gigantes
      g.beginPath(); g.moveTo(-r * 0.7, cy - r * 0.7); g.lineTo(-r * 0.4, cy - r * 1.35); g.lineTo(-r * 0.1, cy - r * 0.85); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(r * 0.1, cy - r * 0.85); g.lineTo(r * 0.4, cy - r * 1.35); g.lineTo(r * 0.7, cy - r * 0.7); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#fecdd3";
      g.beginPath(); g.moveTo(-r * 0.6, cy - r * 0.75); g.lineTo(-r * 0.4, cy - r * 1.2); g.lineTo(-r * 0.2, cy - r * 0.85); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(r * 0.2, cy - r * 0.85); g.lineTo(r * 0.4, cy - r * 1.2); g.lineTo(r * 0.6, cy - r * 0.75); g.closePath(); g.fill();

      // Coroa de Ouro Real na Cabeça (com rubis reluzentes)
      g.fillStyle = "#facc15";
      g.strokeStyle = "#141414";
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(-13 * s, cy - r * 0.95);
      g.lineTo(-15 * s, cy - r * 1.45);
      g.lineTo(-7 * s, cy - r * 1.15);
      g.lineTo(0, cy - r * 1.55);
      g.lineTo(7 * s, cy - r * 1.15);
      g.lineTo(15 * s, cy - r * 1.45);
      g.lineTo(13 * s, cy - r * 0.95);
      g.closePath();
      g.fill(); g.stroke();
      // Rubis na coroa
      g.fillStyle = "#ef4444";
      circle(g, -15 * s, cy - r * 1.45, 2.2 * s); g.fill();
      circle(g, 0, cy - r * 1.55, 2.8 * s); g.fill();
      circle(g, 15 * s, cy - r * 1.45, 2.2 * s); g.fill();

      // Olhos com brilho épico
      g.fillStyle = "#141414";
      circle(g, -r * 0.38, cy - 2 * s, 3.2 * s); g.fill();
      circle(g, r * 0.16, cy - 2 * s, 3.2 * s); g.fill();
      g.fillStyle = "#fde047";
      circle(g, -r * 0.38 + 1, cy - 3 * s, 1.2 * s); g.fill();
      circle(g, r * 0.16 + 1, cy - 3 * s, 1.2 * s); g.fill();

      // Boquinha determinada
      g.strokeStyle = "#141414";
      g.lineWidth = 2.2;
      g.beginPath();
      g.arc(-r * 0.22, cy + 4 * s, 4 * s, 0, Math.PI);
      g.arc(-r * 0.02, cy + 4 * s, 4 * s, 0, Math.PI);
      g.stroke();
    }
    // 1. GATO TANQUE (Borracha / Pill shape)
    else if(d.catType === "tank"){
      const w = 42 * s, h = 64 * s;
      const by = -h - bob;
      
      // Patinhas curtas
      g.fillStyle = "#ffffff";
      g.fillRect(-w * 0.35 + walkStep * 4, -8 * s, 10 * s, 8 * s);
      g.strokeRect(-w * 0.35 + walkStep * 4, -8 * s, 10 * s, 8 * s);
      g.fillRect(w * 0.05 - walkStep * 4, -8 * s, 10 * s, 8 * s);
      g.strokeRect(w * 0.05 - walkStep * 4, -8 * s, 10 * s, 8 * s);

      // Corpo retangular alto arredondado
      rr(g, -w / 2, by, w, h, 14 * s);
      g.fill(); g.stroke();

      // Olhos serenos ( - _ - )
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(-w * 0.35, by + h * 0.3); g.lineTo(-w * 0.15, by + h * 0.3);
      g.moveTo(-w * 0.05, by + h * 0.3); g.lineTo(w * 0.15, by + h * 0.3);
      g.stroke();
      // Narizinho / boca
      circle(g, -w * 0.1, by + h * 0.42, 1.8 * s);
      g.fillStyle = "#141414"; g.fill();
    }
    // 2. GATO LEÃO / VACA (Efeito chamas / mane de leão veloz)
    else if(d.catType === "lion"){
      const r = 20 * s;
      const cy = -r - 18 * s - bob;

      // Linhas de vento de velocidade
      if(f.moving){
        g.strokeStyle = "rgba(255, 200, 50, 0.7)";
        g.lineWidth = 3;
        for(let i = -1; i <= 1; i++){
          g.beginPath();
          g.moveTo(r * 1.5, cy + i * 12 * s);
          g.lineTo(r * 1.5 + 24 * s, cy + i * 12 * s);
          g.stroke();
        }
      }

      // Pernas correndo rápido
      g.fillStyle = "#ffffff";
      g.strokeStyle = "#141414";
      g.lineWidth = 2.5;
      for(let i = 0; i < 4; i++){
        const px = -r * 0.6 + i * 10 * s + Math.sin(f.walk * 18 + i) * 6 * s;
        g.fillRect(px, -14 * s, 6 * s, 14 * s);
        g.strokeRect(px, -14 * s, 6 * s, 14 * s);
      }

      // Juba de Leão em forma de pétalas flamejantes
      const maneCount = 10;
      for(let i = 0; i < maneCount; i++){
        const ang = (i / maneCount) * Math.PI * 2 + (f.moving ? Math.sin(t * 12 + i) * 0.2 : 0);
        const mx = Math.cos(ang) * (r + 14 * s);
        const my = cy + Math.sin(ang) * (r + 14 * s);
        g.fillStyle = i % 2 === 0 ? "#fca5a5" : "#f87171";
        circle(g, mx, my, 8 * s);
        g.fill(); g.stroke();
      }

      // Cabeça do Gato central
      g.fillStyle = "#ffffff";
      circle(g, 0, cy, r);
      g.fill(); g.stroke();

      // Olhos focados e boca aberta no ataque
      g.fillStyle = "#141414";
      circle(g, -r * 0.35, cy - 2 * s, 2.5 * s); g.fill();
      circle(g, r * 0.1, cy - 2 * s, 2.5 * s); g.fill();
      // Orelhas
      g.fillStyle = "#ffffff";
      g.beginPath(); g.moveTo(-r * 0.6, cy - r * 0.8); g.lineTo(-r * 0.4, cy - r * 1.4); g.lineTo(-r * 0.1, cy - r * 0.9); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(r * 0.1, cy - r * 0.9); g.lineTo(r * 0.4, cy - r * 1.4); g.lineTo(r * 0.6, cy - r * 0.8); g.closePath(); g.fill(); g.stroke();
    }
    // 3. GATO PERNAS LONGAS (Sexy Legs Cat)
    else if(d.catType === "legs"){
      const legH = 75 * s;
      const headR = 15 * s;
      const headY = -legH - headR - bob;

      // Pernas longas elegantes e finas
      g.strokeStyle = "#141414";
      g.lineWidth = 3.5;
      g.fillStyle = "#ffffff";

      // Perna da frente (chute no ataque)
      const kick = f.attackT > 0 ? Math.sin((f.attackT / 0.25) * Math.PI) * 40 * s : 0;
      g.beginPath();
      g.moveTo(-4 * s, headY + headR);
      g.quadraticCurveTo(-15 * s - kick, headY + legH * 0.5, -6 * s - kick * 1.3, -2 * s);
      g.stroke();
      // Pé
      circle(g, -6 * s - kick * 1.3, -2 * s, 4 * s); g.fill(); g.stroke();

      // Perna de trás
      g.beginPath();
      g.moveTo(4 * s, headY + headR);
      g.quadraticCurveTo(8 * s, headY + legH * 0.5, 6 * s + walkStep * 10 * s, -2 * s);
      g.stroke();
      circle(g, 6 * s + walkStep * 10 * s, -2 * s, 4 * s); g.fill(); g.stroke();

      // Cabeça redonda no topo
      g.fillStyle = "#ffffff";
      circle(g, 0, headY, headR);
      g.fill(); g.stroke();

      // Orelhas
      g.beginPath(); g.moveTo(-headR * 0.6, headY - headR * 0.8); g.lineTo(-headR * 0.4, headY - headR * 1.3); g.lineTo(-headR * 0.1, headY - headR * 0.85); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(headR * 0.1, headY - headR * 0.85); g.lineTo(headR * 0.4, headY - headR * 1.3); g.lineTo(headR * 0.6, headY - headR * 0.8); g.closePath(); g.fill(); g.stroke();

      // Rostinho
      g.fillStyle = "#141414";
      circle(g, -headR * 0.35, headY - 1 * s, 2 * s); g.fill();
      circle(g, headR * 0.15, headY - 1 * s, 2 * s); g.fill();
    }
    // 4. GATO MACHADO (Axe / Brave Cat)
    else if(d.catType === "axe"){
      const r = 18 * s;
      const cy = -r - 10 * s - bob;

      // Pernas
      g.fillStyle = "#ffffff";
      g.fillRect(-r * 0.5 + walkStep * 4, -10 * s, 8 * s, 10 * s); g.strokeRect(-r * 0.5 + walkStep * 4, -10 * s, 8 * s, 10 * s);
      g.fillRect(r * 0.1 - walkStep * 4, -10 * s, 8 * s, 10 * s); g.strokeRect(r * 0.1 - walkStep * 4, -10 * s, 8 * s, 10 * s);

      // Corpo / Cabeça redonda
      g.fillStyle = "#ffffff";
      circle(g, 0, cy, r);
      g.fill(); g.stroke();

      // Orelhas
      g.beginPath(); g.moveTo(-r * 0.7, cy - r * 0.7); g.lineTo(-r * 0.4, cy - r * 1.3); g.lineTo(-r * 0.1, cy - r * 0.85); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(r * 0.1, cy - r * 0.85); g.lineTo(r * 0.4, cy - r * 1.3); g.lineTo(r * 0.7, cy - r * 0.7); g.closePath(); g.fill(); g.stroke();

      // Faixa vermelha de guerreiro na testa
      g.fillStyle = "#e63946";
      g.fillRect(-r * 0.85, cy - r * 0.35, r * 1.7, 5 * s);
      // Fita voando atrás
      g.beginPath(); g.moveTo(r * 0.8, cy - r * 0.35); g.lineTo(r * 1.4, cy - r * 0.6 + Math.sin(t * 8) * 3); g.lineTo(r * 1.3, cy - r * 0.1); g.closePath(); g.fill();

      // Olhos com raiva ( `д´ )
      g.fillStyle = "#141414";
      g.beginPath();
      g.moveTo(-r * 0.55, cy + 1 * s); g.lineTo(-r * 0.2, cy + 3 * s);
      g.moveTo(r * 0.05, cy + 3 * s); g.lineTo(r * 0.4, cy + 1 * s);
      g.stroke();

      // Machado gigante na mão
      const axeSwing = f.attackT > 0 ? Math.sin((f.attackT / 0.25) * Math.PI) * 1.8 : 0;
      g.save();
      g.translate(-r * 0.5, cy + 2 * s);
      g.rotate(-0.4 - axeSwing);
      // Cabo de madeira
      g.fillStyle = "#8d5b2c";
      g.fillRect(-3 * s, -28 * s, 6 * s, 36 * s);
      g.strokeRect(-3 * s, -28 * s, 6 * s, 36 * s);
      // Lâmina de ferro afiada
      g.fillStyle = "#d1d5db";
      g.beginPath();
      g.moveTo(-16 * s, -28 * s);
      g.quadraticCurveTo(-22 * s, -14 * s, -14 * s, -2 * s);
      g.lineTo(-3 * s, -10 * s);
      g.lineTo(-3 * s, -24 * s);
      g.closePath();
      g.fill(); g.stroke();
      g.restore();
    }
    // 5. GATO TITÃ (Gigante musculoso)
    else if(d.catType === "titan"){
      const w = 65 * s, h = 90 * s;
      const by = -h - bob;

      // Pernas musculosas
      g.fillStyle = "#f3f4f6";
      g.fillRect(-w * 0.4 + walkStep * 4, -20 * s, 18 * s, 20 * s); g.strokeRect(-w * 0.4 + walkStep * 4, -20 * s, 18 * s, 20 * s);
      g.fillRect(w * 0.05 - walkStep * 4, -20 * s, 18 * s, 20 * s); g.strokeRect(w * 0.05 - walkStep * 4, -20 * s, 18 * s, 20 * s);

      // Torso musculoso com peitorais
      g.fillStyle = "#ffffff";
      rr(g, -w / 2, by + 26 * s, w, h - 26 * s, 12 * s);
      g.fill(); g.stroke();

      // Linhas do abdômen sarado / peitoral
      g.strokeStyle = "#9ca3af";
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(-w * 0.35, by + 46 * s); g.quadraticCurveTo(-w * 0.05, by + 52 * s, 0, by + 48 * s);
      g.quadraticCurveTo(w * 0.05, by + 52 * s, w * 0.35, by + 46 * s);
      g.moveTo(0, by + 48 * s); g.lineTo(0, by + 76 * s);
      g.stroke();

      // Braço e punho gigante (slam no ataque)
      const slam = f.attackT > 0 ? Math.sin((f.attackT / 0.25) * Math.PI) * 35 * s : 0;
      g.fillStyle = "#ffffff";
      g.strokeStyle = "#141414";
      g.lineWidth = 2.5;
      circle(g, -w * 0.45 - slam * 0.3, by + 46 * s + slam, 16 * s);
      g.fill(); g.stroke();

      // Cabeça bonitinha e pequena no topo do corpo gigante
      const headR = 15 * s;
      circle(g, 0, by + 20 * s, headR);
      g.fill(); g.stroke();
      // Orelhas
      g.beginPath(); g.moveTo(-headR * 0.6, by + 20 * s - headR * 0.8); g.lineTo(-headR * 0.35, by + 20 * s - headR * 1.3); g.lineTo(-headR * 0.1, by + 20 * s - headR * 0.9); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(headR * 0.1, by + 20 * s - headR * 0.9); g.lineTo(headR * 0.35, by + 20 * s - headR * 1.3); g.lineTo(headR * 0.6, by + 20 * s - headR * 0.8); g.closePath(); g.fill(); g.stroke();
      // Rostinho calmo
      g.fillStyle = "#141414";
      circle(g, -headR * 0.35, by + 20 * s - 1 * s, 2 * s); g.fill();
      circle(g, headR * 0.15, by + 20 * s - 1 * s, 2 * s); g.fill();
    }
    // 6. GATO PÁSSARO (Voando com asas)
    else if(d.catType === "bird"){
      const r = 20 * s;
      const flyY = -55 * s + Math.sin(t * 8) * 6 * s;
      const wingFlap = Math.sin(t * 16) * 12 * s;

      // Asa atrás
      g.fillStyle = "#e5e7eb";
      g.beginPath();
      g.ellipse(r * 0.6, flyY - 4 * s + wingFlap * 0.5, 12 * s, 6 * s, -0.4, 0, Math.PI * 2);
      g.fill(); g.stroke();

      // Corpo redondo
      g.fillStyle = "#ffffff";
      circle(g, 0, flyY, r);
      g.fill(); g.stroke();

      // Orelhas
      g.beginPath(); g.moveTo(-r * 0.6, flyY - r * 0.7); g.lineTo(-r * 0.35, flyY - r * 1.25); g.lineTo(-r * 0.1, flyY - r * 0.8); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(r * 0.1, flyY - r * 0.8); g.lineTo(r * 0.35, flyY - r * 1.25); g.lineTo(r * 0.6, flyY - r * 0.7); g.closePath(); g.fill(); g.stroke();

      // Bico pequeno de passarinho
      g.fillStyle = "#f59e0b";
      g.beginPath();
      g.moveTo(-r * 0.8, flyY + 2 * s);
      g.lineTo(-r * 1.2, flyY + 4 * s);
      g.lineTo(-r * 0.8, flyY + 6 * s);
      g.closePath();
      g.fill(); g.stroke();

      // Olhinho
      g.fillStyle = "#141414";
      circle(g, -r * 0.45, flyY - 2 * s, 2.5 * s); g.fill();

      // Asa na frente
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.ellipse(-2 * s, flyY + 2 * s - wingFlap, 14 * s, 8 * s, 0.3, 0, Math.PI * 2);
      g.fill(); g.stroke();
    }
    // 7. GATO BALEIA/PEIXE
    else if(d.catType === "fish"){
      const w = 48 * s, h = 32 * s;
      const cy = -h * 0.8 - bob;

      // Cauda de peixe
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.moveTo(w * 0.4, cy);
      g.lineTo(w * 0.85, cy - 14 * s + Math.sin(t * 8) * 3);
      g.lineTo(w * 0.75, cy);
      g.lineTo(w * 0.85, cy + 14 * s - Math.sin(t * 8) * 3);
      g.closePath();
      g.fill(); g.stroke();

      // Barbatana dorsal
      g.beginPath();
      g.moveTo(0, cy - h * 0.5);
      g.lineTo(w * 0.15, cy - h * 0.9);
      g.lineTo(w * 0.3, cy - h * 0.5);
      g.closePath();
      g.fill(); g.stroke();

      // Corpo oval de baleia
      g.beginPath();
      g.ellipse(0, cy, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
      g.fill(); g.stroke();

      // Orelhinha de gato no topo
      g.beginPath(); g.moveTo(-w * 0.2, cy - h * 0.5); g.lineTo(-w * 0.1, cy - h * 0.8); g.lineTo(0, cy - h * 0.5); g.closePath(); g.fill(); g.stroke();

      // Mordida com dentes afiados
      g.fillStyle = "#141414";
      circle(g, -w * 0.35, cy - 4 * s, 2.5 * s); g.fill();
      g.beginPath();
      g.moveTo(-w * 0.5, cy + 4 * s);
      g.lineTo(-w * 0.25, cy + 4 * s);
      g.stroke();
    }
    // 8. GATO DRAGÃO (Pescoço comprido, cuspindo fogo)
    else if(d.catType === "dragon"){
      const cy = -50 * s - bob;
      // Corpo base
      g.fillStyle = "#ffffff";
      rr(g, -12 * s, -18 * s, 26 * s, 18 * s, 8 * s); g.fill(); g.stroke();
      // Perninhas
      g.fillRect(-10 * s, -6 * s, 6 * s, 6 * s); g.strokeRect(-10 * s, -6 * s, 6 * s, 6 * s);
      g.fillRect(4 * s, -6 * s, 6 * s, 6 * s); g.strokeRect(4 * s, -6 * s, 6 * s, 6 * s);

      // Pescoço longo curvado
      g.beginPath();
      g.moveTo(-4 * s, -18 * s);
      g.quadraticCurveTo(-20 * s, -35 * s, -15 * s, cy);
      g.quadraticCurveTo(-5 * s, -35 * s, 6 * s, -18 * s);
      g.fill(); g.stroke();

      // Cabeça do dragão
      circle(g, -15 * s, cy, 14 * s); g.fill(); g.stroke();
      // Chifrinho de dragão
      g.fillStyle = "#f59e0b";
      g.beginPath(); g.moveTo(-12 * s, cy - 12 * s); g.lineTo(-8 * s, cy - 22 * s); g.lineTo(-4 * s, cy - 12 * s); g.closePath(); g.fill(); g.stroke();
      // Olho
      g.fillStyle = "#141414";
      circle(g, -19 * s, cy - 2 * s, 2.5 * s); g.fill();
    }
    // 9. GATO PADRÃO / COMUM (O clássico Battle Cat)
    else {
      const r = 18 * s;
      const cy = -r - 10 * s - bob;

      // Patinhas
      g.fillStyle = "#ffffff";
      g.fillRect(-r * 0.45 + walkStep * 4, -10 * s, 8 * s, 10 * s); g.strokeRect(-r * 0.45 + walkStep * 4, -10 * s, 8 * s, 10 * s);
      g.fillRect(r * 0.1 - walkStep * 4, -10 * s, 8 * s, 10 * s); g.strokeRect(r * 0.1 - walkStep * 4, -10 * s, 8 * s, 10 * s);

      // Corpo redondo fofo
      circle(g, 0, cy, r);
      g.fill(); g.stroke();

      // Orelhinhas pontudas
      g.beginPath(); g.moveTo(-r * 0.7, cy - r * 0.7); g.lineTo(-r * 0.4, cy - r * 1.3); g.lineTo(-r * 0.1, cy - r * 0.85); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(r * 0.1, cy - r * 0.85); g.lineTo(r * 0.4, cy - r * 1.3); g.lineTo(r * 0.7, cy - r * 0.7); g.closePath(); g.fill(); g.stroke();
      // Interior rosa das orelhas
      g.fillStyle = "#fecdd3";
      g.beginPath(); g.moveTo(-r * 0.6, cy - r * 0.75); g.lineTo(-r * 0.4, cy - r * 1.15); g.lineTo(-r * 0.2, cy - r * 0.85); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(r * 0.2, cy - r * 0.85); g.lineTo(r * 0.4, cy - r * 1.15); g.lineTo(r * 0.6, cy - r * 0.75); g.closePath(); g.fill();

      // Rostinho clássico (olhos de botão + boca 3)
      g.fillStyle = "#141414";
      circle(g, -r * 0.4, cy - 1 * s, 2.4 * s); g.fill();
      circle(g, r * 0.15, cy - 1 * s, 2.4 * s); g.fill();

      // Boca mordendo se atacando
      if(f.attackT > 0){
        g.beginPath();
        g.ellipse(-r * 0.5, cy + 5 * s, 6 * s, 4 * s, 0, 0, Math.PI * 2);
        g.fill();
      } else {
        // Boquinha de gato :3
        g.strokeStyle = "#141414";
        g.lineWidth = 1.8;
        g.beginPath();
        g.arc(-r * 0.22, cy + 3 * s, 3 * s, 0, Math.PI);
        g.arc(-r * 0.05, cy + 3 * s, 3 * s, 0, Math.PI);
        g.stroke();
      }
    }

    g.restore();

    // Efeito de flash ao levar dano
    if(f.flash > 0){
      g.save();
      g.globalAlpha = Math.min(0.75, f.flash * 3);
      g.fillStyle = "#ffffff";
      circle(g, f.x, GROUND_Y - 30 * s, 32 * s);
      g.fill();
      g.restore();
    }
  }

  // ---------------- INIMIGOS ----------------
  // Inimigos olham naturalmente para a DIREITA (em direção à base dos gatos na direita)
  function drawEnemy(g, f, t){
    const d = f.def;
    const s = d.s || 1.0;
    const type = f.type;

    g.save();
    shadow(g, 0, 24 * s);

    // Inimigos andam para a direita (scale = 1).
    if(f.side === "cat") g.scale(-1, 1);

    // Ataque: lunge para frente (direita)
    const lunge = f.attackT > 0 ? Math.sin((f.attackT / 0.25) * Math.PI) * 10 * s : 0;
    g.translate(lunge, 0);

    // Knockback: empurrado para trás (esquerda) com rotação
    if(f.kbT > 0){
      g.rotate(-0.35);
      g.translate(-14, -8);
    }

    const bob = f.moving ? Math.abs(Math.sin(f.walk * 10)) * 2.8 * s : 0;
    const walkStep = f.moving ? Math.sin(f.walk * 10) : 0;

    g.lineWidth = 2.5;
    g.strokeStyle = "#141414";

    // 1. BONECO PALITO (Those Guys - O clássico do Battle Cats)
    if(type === "palito"){
      const headR = 12 * s;
      const headY = -48 * s - bob;
      g.fillStyle = "#ffffff";

      // Pernas palito correndo
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(0, headY + headR + 18 * s);
      g.lineTo(-10 * s + walkStep * 8 * s, -2 * s);
      g.moveTo(0, headY + headR + 18 * s);
      g.lineTo(10 * s - walkStep * 8 * s, -2 * s);
      g.stroke();

      // Tronco palito
      g.beginPath();
      g.moveTo(0, headY + headR);
      g.lineTo(0, headY + headR + 18 * s);
      g.stroke();

      // Braços balançando
      g.beginPath();
      g.moveTo(0, headY + headR + 6 * s);
      g.lineTo(14 * s + walkStep * 6 * s, headY + headR + 14 * s);
      g.moveTo(0, headY + headR + 6 * s);
      g.lineTo(-14 * s - walkStep * 6 * s, headY + headR + 14 * s);
      g.stroke();

      // Cabeça redonda branca
      circle(g, 0, headY, headR);
      g.fill(); g.stroke();

      // Olhos pretos simples
      g.fillStyle = "#141414";
      circle(g, 4 * s, headY - 1 * s, 2 * s); g.fill();
      circle(g, -3 * s, headY - 1 * s, 2 * s); g.fill();
    }
    // 2. SNACHE (A Cobra)
    else if(type === "rato"){
      const w = 44 * s, h = 20 * s;
      const cy = -h * 0.7 - bob;
      g.fillStyle = "#ffffff";

      // Corpo sinuoso da serpente
      g.beginPath();
      g.moveTo(-w * 0.5, cy + 6 * s);
      g.quadraticCurveTo(-w * 0.2, cy - 10 * s + Math.sin(f.walk * 12) * 5, 0, cy + 2 * s);
      g.quadraticCurveTo(w * 0.2, cy + 12 * s - Math.sin(f.walk * 12) * 5, w * 0.45, cy - 4 * s);
      g.lineWidth = 14 * s;
      g.lineCap = "round";
      g.strokeStyle = "#ffffff";
      g.stroke();
      g.lineWidth = 14 * s + 5;
      // Contorno
      g.lineCap = "round";

      // Cabeça da cobra
      g.lineWidth = 2.5;
      g.strokeStyle = "#141414";
      circle(g, w * 0.45, cy - 4 * s, 10 * s);
      g.fill(); g.stroke();

      // Coleira vermelha estilosa do Snache
      g.fillStyle = "#ef4444";
      rr(g, w * 0.22, cy - 10 * s, 7 * s, 12 * s, 2 * s);
      g.fill(); g.stroke();

      // Olhinho e língua
      g.fillStyle = "#141414";
      circle(g, w * 0.52, cy - 6 * s, 2.2 * s); g.fill();
      // Língua bifurcada
      g.strokeStyle = "#ef4444";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(w * 0.65, cy - 4 * s);
      g.lineTo(w * 0.8, cy - 4 * s);
      g.lineTo(w * 0.88, cy - 7 * s);
      g.moveTo(w * 0.8, cy - 4 * s);
      g.lineTo(w * 0.88, cy - 1 * s);
      g.stroke();
    }
    // 3. DOGE (O Cachorro Caramelo / Doge oficial)
    else if(type === "caramelo"){
      const w = 40 * s, h = 26 * s;
      const cy = -h - 10 * s - bob;
      g.fillStyle = "#f5d0a9"; // Tom shiba inu autêntico

      // Perninhas
      g.fillRect(-w * 0.35 + walkStep * 4, -10 * s, 7 * s, 10 * s); g.strokeRect(-w * 0.35 + walkStep * 4, -10 * s, 7 * s, 10 * s);
      g.fillRect(w * 0.15 - walkStep * 4, -10 * s, 7 * s, 10 * s); g.strokeRect(w * 0.15 - walkStep * 4, -10 * s, 7 * s, 10 * s);

      // Rabinho abanando alegre
      g.strokeStyle = "#141414";
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(-w * 0.4, cy);
      g.quadraticCurveTo(-w * 0.7, cy - 18 * s + Math.sin(t * 12) * 4, -w * 0.5, cy - 22 * s);
      g.stroke();

      // Corpo oval
      g.beginPath();
      g.ellipse(0, cy, w * 0.45, h * 0.45, 0, 0, Math.PI * 2);
      g.fill(); g.stroke();

      // Peito branco do Doge
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.ellipse(w * 0.15, cy + 3 * s, w * 0.22, h * 0.3, 0, 0, Math.PI * 2);
      g.fill();

      // Cabeça do Doge
      g.fillStyle = "#f5d0a9";
      circle(g, w * 0.35, cy - 4 * s, 13 * s);
      g.fill(); g.stroke();

      // Focinho branco
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.ellipse(w * 0.52, cy - 2 * s, 6 * s, 5 * s, 0, 0, Math.PI * 2);
      g.fill(); g.stroke();

      // Nariz preto
      g.fillStyle = "#141414";
      circle(g, w * 0.62, cy - 4 * s, 2 * s); g.fill();
      // Olho esperto
      circle(g, w * 0.42, cy - 8 * s, 2.2 * s); g.fill();

      // Orelha pontuda ereta
      g.fillStyle = "#d97706";
      g.beginPath();
      g.moveTo(w * 0.2, cy - 14 * s);
      g.lineTo(w * 0.32, cy - 24 * s);
      g.lineTo(w * 0.45, cy - 14 * s);
      g.closePath();
      g.fill(); g.stroke();
    }
    // 4. HIPOPÓTAMO HIPPOE (Javali/Hippo)
    else if(type === "javali"){
      const w = 55 * s, h = 38 * s;
      const cy = -h - 10 * s - bob;
      g.fillStyle = "#f472b6"; // Rosa autêntico do Hippoe

      // Pernas pesadas
      g.fillRect(-w * 0.35 + walkStep * 4, -12 * s, 12 * s, 12 * s); g.strokeRect(-w * 0.35 + walkStep * 4, -12 * s, 12 * s, 12 * s);
      g.fillRect(w * 0.1 - walkStep * 4, -12 * s, 12 * s, 12 * s); g.strokeRect(w * 0.1 - walkStep * 4, -12 * s, 12 * s, 12 * s);

      // Corpo roliço maciço
      rr(g, -w * 0.45, cy, w * 0.85, h, 14 * s);
      g.fill(); g.stroke();

      // Boca enorme de hipopótamo
      g.beginPath();
      circle(g, w * 0.45, cy + h * 0.3, 16 * s);
      g.fill(); g.stroke();

      // Narinas e dentes brancos
      g.fillStyle = "#ffffff";
      g.fillRect(w * 0.45, cy + h * 0.4, 5 * s, 6 * s); g.strokeRect(w * 0.45, cy + h * 0.4, 5 * s, 6 * s);
      // Olhinho
      g.fillStyle = "#141414";
      circle(g, w * 0.3, cy + 2 * s, 3 * s); g.fill();
    }
    // 5. PROFESSOR URSO (Teacher Bear - Boss)
    else if(type === "urso"){
      const w = 60 * s, h = 95 * s;
      const cy = -h - bob;
      g.fillStyle = "#78350f"; // Marrom escuro do urso

      // Pernas eretas
      g.fillRect(-w * 0.3 + walkStep * 4, -18 * s, 16 * s, 18 * s); g.strokeRect(-w * 0.3 + walkStep * 4, -18 * s, 16 * s, 18 * s);
      g.fillRect(w * 0.05 - walkStep * 4, -18 * s, 16 * s, 18 * s); g.strokeRect(w * 0.05 - walkStep * 4, -18 * s, 16 * s, 18 * s);

      // Tronco imponente
      rr(g, -w * 0.45, cy + 24 * s, w * 0.8, h - 24 * s, 16 * s);
      g.fill(); g.stroke();

      // Garras vermelhas afiadas
      const clawSlash = f.attackT > 0 ? Math.sin((f.attackT / 0.25) * Math.PI) * 20 * s : 0;
      g.fillStyle = "#ef4444";
      circle(g, w * 0.4 + clawSlash, cy + 45 * s, 12 * s);
      g.fill(); g.stroke();

      // Cabeça do urso
      g.fillStyle = "#78350f";
      circle(g, w * 0.2, cy + 18 * s, 18 * s);
      g.fill(); g.stroke();
      // Orelhas redondas
      circle(g, w * 0.05, cy + 4 * s, 6 * s); g.fill(); g.stroke();
      circle(g, w * 0.35, cy + 4 * s, 6 * s); g.fill(); g.stroke();
      // Focinho claro
      g.fillStyle = "#fed7aa";
      circle(g, w * 0.3, cy + 22 * s, 8 * s); g.fill(); g.stroke();
      g.fillStyle = "#141414";
      circle(g, w * 0.35, cy + 20 * s, 3 * s); g.fill();
      // Olho brilhante
      g.fillStyle = "#facc15";
      circle(g, w * 0.18, cy + 14 * s, 3.5 * s); g.fill();
    }
    // 6. GORILA SUPREMO (Boss Final)
    else if(type === "gorila"){
      const w = 75 * s, h = 100 * s;
      const cy = -h - bob;
      g.fillStyle = "#1f2937"; // Pelagem grafite/preto

      // Pernas musculosas
      g.fillRect(-w * 0.35 + walkStep * 4, -18 * s, 20 * s, 18 * s); g.strokeRect(-w * 0.35 + walkStep * 4, -18 * s, 20 * s, 18 * s);
      g.fillRect(w * 0.05 - walkStep * 4, -18 * s, 20 * s, 18 * s); g.strokeRect(w * 0.05 - walkStep * 4, -18 * s, 20 * s, 18 * s);

      // Tronco massivo
      rr(g, -w * 0.45, cy + 22 * s, w * 0.85, h - 22 * s, 18 * s);
      g.fill(); g.stroke();

      // Peito cinza definido
      g.fillStyle = "#374151";
      rr(g, -w * 0.25, cy + 32 * s, w * 0.55, 34 * s, 8 * s);
      g.fill();

      // Brações batendo no peito / golpeando
      const beat = f.attackT > 0 ? Math.sin((f.attackT / 0.25) * Math.PI) * 24 * s : 0;
      g.fillStyle = "#1f2937";
      circle(g, w * 0.45 + beat, cy + 48 * s, 18 * s);
      g.fill(); g.stroke();

      // Cabeça do gorila com crista sagital
      circle(g, w * 0.15, cy + 16 * s, 18 * s);
      g.fill(); g.stroke();
      // Olhos vermelhos furiosos
      g.fillStyle = "#ef4444";
      circle(g, w * 0.25, cy + 14 * s, 3.5 * s); g.fill();
      // Dentes/presas
      g.fillStyle = "#ffffff";
      g.fillRect(w * 0.25, cy + 26 * s, 4 * s, 6 * s);
      g.fillRect(w * 0.35, cy + 26 * s, 4 * s, 6 * s);
    }
    // Outros genéricos
    else {
      g.fillStyle = "#9ca3af";
      circle(g, 0, -25 * s - bob, 20 * s);
      g.fill(); g.stroke();
    }

    g.restore();

    // Flash de dano
    if(f.flash > 0){
      g.save();
      g.globalAlpha = Math.min(0.75, f.flash * 3);
      g.fillStyle = "#ffffff";
      circle(g, f.x, GROUND_Y - 30 * s, 32 * s);
      g.fill();
      g.restore();
    }
  }

  // ---------------- BASE DOS GATOS (À DIREITA) ----------------
  // Réplica autêntica da base do Battle Cats mostrada nas fotos do usuário
  function drawCatBase(g, hpRatio, t, isLaserFiring = false){
    const x = CAT_BASE_X;
    const y = GROUND_Y;

    g.save();
    shadow(g, x, 75);

    // 1. Corpo da torre (Casinha com manchas marrons)
    const baseW = 120, baseH = 150;
    const bx = x - baseW / 2, by = y - baseH;

    // Paredes de gesso bege/creme
    g.fillStyle = "#faf7ee";
    g.strokeStyle = "#141414";
    g.lineWidth = 3;
    rr(g, bx, by, baseW, baseH, 18);
    g.fill(); g.stroke();

    // Manchas marrons circulares autênticas (como na foto)
    g.fillStyle = "#b45309";
    const spots = [
      [bx + 20, by + 28, 12, 10],
      [bx + 102, by + 34, 11, 13],
      [bx + 24, by + 82, 13, 11],
      [bx + 96, by + 95, 14, 12],
      [bx + 18, by + 130, 10, 8],
      [bx + 105, by + 132, 10, 9]
    ];
    spots.forEach(([sx, sy, rx, ry]) => {
      g.beginPath();
      g.ellipse(sx, sy, rx, ry, 0.2, 0, Math.PI * 2);
      g.fill();
    });

    // Porta em arco escuro na base
    g.fillStyle = "#1e1b18";
    g.beginPath();
    g.moveTo(x - 22, y);
    g.lineTo(x - 22, y - 55);
    g.arcTo(x - 22, y - 75, x, y - 75, 22);
    g.arcTo(x + 22, y - 75, x + 22, y - 55, 22);
    g.lineTo(x + 22, y);
    g.closePath();
    g.fill(); g.stroke();

    // Placa de madeira suspensa por correntes com pata de gato
    // Correntes
    g.strokeStyle = "#64748b";
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(x - 28, by + 12); g.lineTo(x - 28, by + 24);
    g.moveTo(x + 28, by + 12); g.lineTo(x + 28, by + 24);
    g.stroke();
    // Placa de madeira
    g.fillStyle = "#d97706";
    g.strokeStyle = "#141414";
    g.lineWidth = 2.5;
    rr(g, x - 38, by + 24, 76, 26, 4);
    g.fill(); g.stroke();
    // Patinha de gato desenhada na placa (🐾)
    g.fillStyle = "#141414";
    circle(g, x, by + 39, 5); g.fill();
    circle(g, x - 6, by + 32, 2.5); g.fill();
    circle(g, x, by + 30, 2.5); g.fill();
    circle(g, x + 6, by + 32, 2.5); g.fill();

    // 2. Cabeça do Canhão de Gato (No topo da torre)
    const headY = by - 32;
    const headR = 36;
    g.fillStyle = "#ffffff";
    g.strokeStyle = "#141414";
    g.lineWidth = 3;
    circle(g, x, headY, headR);
    g.fill(); g.stroke();

    // Orelhas de gato
    g.beginPath(); g.moveTo(x - headR * 0.7, headY - headR * 0.6); g.lineTo(x - headR * 0.5, headY - headR * 1.35); g.lineTo(x - headR * 0.15, headY - headR * 0.85); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x + headR * 0.15, headY - headR * 0.85); g.lineTo(x + headR * 0.5, headY - headR * 1.35); g.lineTo(x + headR * 0.7, headY - headR * 0.6); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fecdd3";
    g.beginPath(); g.moveTo(x - headR * 0.6, headY - headR * 0.7); g.lineTo(x - headR * 0.5, headY - headR * 1.2); g.lineTo(x - headR * 0.25, headY - headR * 0.85); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x + headR * 0.25, headY - headR * 0.85); g.lineTo(x + headR * 0.5, headY - headR * 1.2); g.lineTo(x + headR * 0.6, headY - headR * 0.7); g.closePath(); g.fill();

    // Olhinhos e bigodes
    g.fillStyle = "#141414";
    circle(g, x - 16, headY - 14, 3.5); g.fill();
    circle(g, x + 16, headY - 14, 3.5); g.fill();

    // Cano do Canhão saindo da boca (apontando para a ESQUERDA)
    g.save();
    g.translate(x - 22, headY + 12);
    // Tubo de metal cilíndrico
    g.fillStyle = "#64748b";
    g.strokeStyle = "#141414";
    g.lineWidth = 2.5;
    g.beginPath();
    g.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
    g.fill(); g.stroke();
    // Boca interna do canhão
    g.fillStyle = isLaserFiring ? "#38bdf8" : "#0f172a";
    g.beginPath();
    g.ellipse(-2, 0, 10, 14, 0, 0, Math.PI * 2);
    g.fill(); g.stroke();
    g.restore();

    // 3. Braço mecânico e Antena Parabólica / Radar no topo da cabeça
    const armX = x + 6;
    const armY = headY - headR + 2;
    // Braço robótico metálico articulado
    g.strokeStyle = "#64748b";
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(armX, armY);
    g.lineTo(armX + 16, armY - 30);
    g.lineTo(armX - 4, armY - 58);
    g.stroke();
    g.strokeStyle = "#141414";
    g.lineWidth = 2;
    g.stroke();

    // Prato do radar (Dourado/Amarelo com haste vermelha)
    const dishX = armX - 4;
    const dishY = armY - 62;
    const dishAngle = -0.35 + Math.sin(t * 3) * 0.12;

    g.save();
    g.translate(dishX, dishY);
    g.rotate(dishAngle);
    // Disco dourado parabólico
    g.fillStyle = "#facc15";
    g.strokeStyle = "#141414";
    g.lineWidth = 3;
    g.beginPath();
    g.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2);
    g.fill(); g.stroke();
    // Círculo interno
    g.fillStyle = "#eab308";
    g.beginPath();
    g.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2);
    g.fill();
    // Haste transmissora central com ponta vermelha
    g.strokeStyle = "#141414";
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(-18, 0);
    g.stroke();
    g.fillStyle = "#ef4444";
    circle(g, -18, 0, 4);
    g.fill(); g.stroke();
    g.restore();

    // 4. Contador de HP flutuante exatamente no estilo da foto (ex: 36000/36000)
    const hpTxt = Math.max(0, Math.round(hpRatio * PLAYER_BASE_HP)) + "/" + PLAYER_BASE_HP;
    g.font = "900 17px 'Titan One', 'Outfit', 'Trebuchet MS', sans-serif";
    g.textAlign = "center";
    // Sombra grossa preta retro flutuando bem acima do radar
    g.strokeStyle = "#000000";
    g.lineWidth = 4;
    g.strokeText(hpTxt, x, by - 148);
    g.fillStyle = "#ffffff";
    g.fillText(hpTxt, x, by - 148);

    g.restore();
  }

  // ---------------- BASE INIMIGA E VÓRTICE (À ESQUERDA) ----------------
  function drawEnemyBase(g, hpRatio, currentHp, maxHp, t, ch){
    const x = ENEMY_BASE_X;
    const y = GROUND_Y;

    g.save();
    shadow(g, x, 75);

    // 1. Fortaleza / Ruína de Pedra no chão
    const baseW = 120, baseH = 135;
    const bx = x - baseW / 2, by = y - baseH;

    // Muros de pedra antiga
    g.fillStyle = "#334155";
    g.strokeStyle = "#0f172a";
    g.lineWidth = 3;
    rr(g, bx, by, baseW, baseH, 10);
    g.fill(); g.stroke();

    // Ameias pontiagudas góticas
    g.fillStyle = "#1e293b";
    for(let i = 0; i < 4; i++){
      g.beginPath();
      g.moveTo(bx + 8 + i * 28, by);
      g.lineTo(bx + 18 + i * 28, by - 18);
      g.lineTo(bx + 28 + i * 28, by);
      g.closePath();
      g.fill(); g.stroke();
    }

    // Portal de entrada sombrio
    g.fillStyle = "#090d16";
    g.beginPath();
    g.moveTo(x - 22, y);
    g.lineTo(x - 22, y - 60);
    g.arcTo(x - 22, y - 76, x, y - 76, 22);
    g.arcTo(x + 22, y - 76, x + 22, y - 60, 22);
    g.lineTo(x + 22, y);
    g.closePath();
    g.fill(); g.stroke();

    // Tochas animadas
    for(const tx of [x - 42, x + 42]){
      g.fillStyle = "#b45309";
      g.fillRect(tx - 3, by + 40, 6, 20);
      // Chama da tocha
      const fl = Math.sin(t * 12 + tx) * 4;
      g.fillStyle = "#f59e0b";
      circle(g, tx, by + 34 + fl * 0.3, 7 + fl * 0.2);
      g.fill();
      g.fillStyle = "#ef4444";
      circle(g, tx, by + 32 + fl * 0.3, 4);
      g.fill();
    }

    // Caveira emblemática no topo da porta
    g.fillStyle = "#e2e8f0";
    circle(g, x, by + 35, 11); g.fill();
    g.fillStyle = "#0f172a";
    circle(g, x - 4, by + 34, 2.5); g.fill();
    circle(g, x + 4, by + 34, 2.5); g.fill();

    // 2. Contador de HP flutuante da base inimiga
    const ehpTxt = Math.max(0, Math.round(currentHp)) + "/" + maxHp;
    g.font = "900 17px 'Titan One', 'Outfit', 'Trebuchet MS', sans-serif";
    g.textAlign = "center";
    g.strokeStyle = "#000000";
    g.lineWidth = 4;
    g.strokeText(ehpTxt, x, by - 25);
    g.fillStyle = "#ffffff";
    g.fillText(ehpTxt, x, by - 25);

    // 3. O VÓRTICE CÓSMICO SOMBRIO NO CÉU (Como nas fotos do usuário!)
    const vortexX = x + 200;
    const vortexY = 130;
    const vR = 48;

    g.save();
    g.translate(vortexX, vortexY);

    // Braços espirais do vórtice escuro
    const armCount = 14;
    for(let i = 0; i < armCount; i++){
      const ang = (i / armCount) * Math.PI * 2 + t * 1.5;
      g.strokeStyle = i % 2 === 0 ? "rgba(14, 116, 144, 0.75)" : "rgba(30, 27, 75, 0.85)";
      g.lineWidth = 3.5;
      g.beginPath();
      for(let r = 10; r < vR + 25; r += 6){
        const a = ang + (r * 0.08);
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * (r * 0.7);
        if(r === 10) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke();
    }

    // Núcleo escuro do buraco negro
    g.fillStyle = "#030712";
    g.beginPath();
    g.ellipse(0, 0, vR * 0.7, vR * 0.55, 0, 0, Math.PI * 2);
    g.fill();

    // Dois olhos vermelhos ameaçadores brilhando nas sombras (como na foto!)
    const eyeGlow = 0.85 + Math.sin(t * 6) * 0.15;
    g.fillStyle = "#ef4444";
    g.shadowColor = "#ef4444";
    g.shadowBlur = 10;
    // Olho esquerdo
    g.beginPath();
    g.ellipse(-12, -2, 6 * eyeGlow, 8 * eyeGlow, -0.2, 0, Math.PI * 2);
    g.fill();
    // Olho direito
    g.beginPath();
    g.ellipse(12, -2, 6 * eyeGlow, 8 * eyeGlow, 0.2, 0, Math.PI * 2);
    g.fill();
    g.shadowBlur = 0;

    // Pupila vertical preta
    g.fillStyle = "#000000";
    circle(g, -12, -2, 2.5); g.fill();
    circle(g, 12, -2, 2.5); g.fill();

    g.restore();

    g.restore();
  }

  // ---------------- CENÁRIO & CÉU ANIME ----------------
  function drawBackground(g, W, H, ch, t){
    // 1. Céu com degradê de iluminação vibrante
    const skyGrad = g.createLinearGradient(0, 0, 0, GROUND_Y);
    if(ch === 0){
      // Céu azul límpido do Battle Cats (Coréia/China/Japão)
      skyGrad.addColorStop(0, "#38bdf8");
      skyGrad.addColorStop(0.55, "#7dd3fc");
      skyGrad.addColorStop(1, "#e0f2fe");
    } else if(ch === 1){
      // Tarde dourada metropolitana
      skyGrad.addColorStop(0, "#f97316");
      skyGrad.addColorStop(0.6, "#fdba74");
      skyGrad.addColorStop(1, "#fef3c7");
    } else {
      // Espaço cósmico noturno
      skyGrad.addColorStop(0, "#0f172a");
      skyGrad.addColorStop(0.6, "#1e1b4b");
      skyGrad.addColorStop(1, "#312e81");
    }
    g.fillStyle = skyGrad;
    g.fillRect(0, 0, W, GROUND_Y);

    // 2. Nuvens fofas estilo anime pintadas à mão
    const cloudCol = ch === 2 ? "rgba(147, 197, 253, 0.25)" : "rgba(255, 255, 255, 0.92)";
    const cloudShad = ch === 2 ? "rgba(99, 102, 241, 0.2)" : "rgba(186, 230, 253, 0.75)";

    const clouds = [
      { x: (W * 0.12 + t * 8) % (W + 280) - 140, y: 100, s: 1.3 },
      { x: (W * 0.50 + t * 11) % (W + 280) - 140, y: 145, s: 1.6 },
      { x: (W * 0.85 + t * 6) % (W + 280) - 140, y: 115, s: 1.2 }
    ];

    clouds.forEach(c => {
      g.save();
      g.translate(c.x, c.y);
      g.scale(c.s, c.s);

      // Sombra inferior da nuvem
      g.fillStyle = cloudShad;
      g.beginPath();
      g.arc(-42, 14, 26, 0, Math.PI * 2);
      g.arc(-14, 18, 32, 0, Math.PI * 2);
      g.arc(20, 16, 28, 0, Math.PI * 2);
      g.arc(48, 14, 22, 0, Math.PI * 2);
      g.fill();

      // Topo iluminado fofo da nuvem
      g.fillStyle = cloudCol;
      g.beginPath();
      g.arc(-40, 4, 24, 0, Math.PI * 2);
      g.arc(-16, -12, 34, 0, Math.PI * 2);
      g.arc(16, -8, 30, 0, Math.PI * 2);
      g.arc(46, 6, 22, 0, Math.PI * 2);
      g.fill();
      g.restore();
    });

    // 3. Campo de grama verde vibrante com perspectiva
    const grassGrad = g.createLinearGradient(0, GROUND_Y, 0, H);
    if(ch === 0){
      grassGrad.addColorStop(0, "#a3e635"); // Verde claro no horizonte
      grassGrad.addColorStop(0.3, "#84cc16");
      grassGrad.addColorStop(1, "#65a30d");  // Verde intenso no primeiro plano
    } else if(ch === 1){
      grassGrad.addColorStop(0, "#94a3b8");
      grassGrad.addColorStop(1, "#475569");
    } else {
      grassGrad.addColorStop(0, "#6366f1");
      grassGrad.addColorStop(1, "#312e81");
    }

    g.fillStyle = grassGrad;
    g.fillRect(0, GROUND_Y, W, H - GROUND_Y);

    // Linha de horizonte nítida do gramado
    g.strokeStyle = "rgba(0, 0, 0, 0.12)";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(0, GROUND_Y);
    g.lineTo(W, GROUND_Y);
    g.stroke();

    // Detalhes delicados de flores e graminhas no campo
    if(ch === 0){
      for(let i = 0; i < 28; i++){
        const fx = (i * 47) % W;
        const fy = GROUND_Y + 16 + ((i * 31) % 110);
        g.fillStyle = i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#fde047" : "#f472b6";
        circle(g, fx, fy, 2.5);
        g.fill();
      }
    }
  }

  // ---------------- CANHÃO LASER DOS GATOS (Efeito visual) ----------------
  function drawLaserBeam(g, startX, t, power = 1.0){
    g.save();
    const beamY = GROUND_Y - 50;

    // Brilho exterior azul/ciano cósmico
    g.fillStyle = "rgba(56, 189, 248, " + (0.45 * power) + ")";
    g.fillRect(0, beamY - 45, startX, 90);

    // Feixe intermediário elétrico
    g.fillStyle = "rgba(125, 211, 252, " + (0.8 * power) + ")";
    g.fillRect(0, beamY - 24, startX, 48);

    // Núcleo branco puro ofuscante
    g.fillStyle = "rgba(255, 255, 255, " + (1.0 * power) + ")";
    g.fillRect(0, beamY - 10, startX, 20);

    // Anéis de choque de energia se propagando
    for(let i = 0; i < 6; i++){
      const rx = (startX - (t * 800 + i * 220) % startX);
      g.strokeStyle = "rgba(255, 255, 255, 0.9)";
      g.lineWidth = 4;
      g.beginPath();
      g.ellipse(rx, beamY, 18, 45, 0, 0, Math.PI * 2);
      g.stroke();
    }
    g.restore();
  }

  // Retrato do gato (para cartas e tela de exército)
  function drawPortrait(g, size, def, t){
    g.clearRect(0, 0, size, size);
    g.save();
    g.translate(size / 2, size * 0.85);
    const s = def.s || 1.0;
    
    let baseH = 50;
    if(def.catType === "legs") baseH = 112;
    else if(def.catType === "titan") baseH = 108;
    else if(def.catType === "dragon") baseH = 92;
    else if(def.catType === "bird") baseH = 82;
    else if(def.catType === "tank") baseH = 76;
    else if(def.catType === "lion") baseH = 68;
    else if(def.catType === "fish") baseH = 58;
    else if(def.catType === "axe") baseH = 58;
    baseH *= s;

    const k = (size * 0.70) / baseH;
    g.scale(k, k);
    drawCat(g, {
      def, side: "cat", x: 0, walk: 0, moving: false,
      attackT: 0, kbT: 0, flash: 0, phase: 1.2, isPortrait: true
    }, t || 1);
    g.restore();
  }

  return {
    drawCat, drawEnemy, drawCatBase, drawEnemyBase, drawBackground,
    drawLaserBeam, drawHitStar, drawDustPuff, drawPortrait,
    circle, rr
  };
})();
