"use strict";

// ===== Dados: gatos, inimigos, fases, economia (Estilo The Battle Cats) =====

const GROUND_Y = 560;
const CAT_BASE_X = 1100;         // Base dos Gatos fica à DIREITA (como no original)
const ENEMY_BASE_X = 180;        // Base / Portal Inimigo fica à ESQUERDA
const PLAYER_BASE_HP = 36000;    // HP da Base dos Gatos (como visto na foto 36000/36000)
const MAX_FIELD = 16;            // máx. de lutadores por lado em campo
const START_MONEY = 220;

// Canhão Laser da Base dos Gatos
const CANNON = {
  chargeTime: 30,                // segundos para recarregar 100%
  dmg: 500,                      // dano em área em toda a tela
  kbDist: 160                    // empurrão forte em todos os inimigos
};

// Gato Gigante Lendário (Invocado pelo Canhão)
const MEGA_CAT = {
  id: "mega_gato",
  name: "Gato Gigante",
  catType: "mega",
  emoji: "👑",
  color: "#ffffff",
  cost: 0,
  cd: 0,
  hp: 7500,
  atk: 350,
  spd: 35,
  range: 70,
  aspd: 1.3,
  s: 2.2,                       // Escala Gigante e colossal!
  aoe: 190,
  big: true
};

// Carteira / Worker Cat (Trabalhador Gato)
const WALLET = {
  max: 8,
  income: lvl => 12 + lvl * 7,
  cap: lvl => 1000 + lvl * 500,
  cost: lvl => Math.round(180 * Math.pow(1.5, lvl - 1))
};

// ---- Gatos (unidades do jogador) ----
// cost/cd em batalha; unlock em 🐟; hp/atk base (nível 1)
const CATS = [
  { id: "comum",   name: "Gato Comum",        catType: "basic",  emoji: "🐱", color: "#ffffff", cost: 75,   cd: 2.0,  hp: 180,  atk: 25,  spd: 45,  range: 36,  aspd: 1.0,  s: 1.0,  unlock: 0 },
  { id: "tanque",  name: "Gato Tanque",       catType: "tank",   emoji: "🛡️", color: "#f8f9fa", cost: 100,  cd: 3.5,  hp: 950,  atk: 10,  spd: 26,  range: 34,  aspd: 1.3,  s: 1.25, fat: true, unlock: 0 },
  { id: "machado", name: "Gato Machado",      catType: "axe",    emoji: "🪓", color: "#ffffff", cost: 150,  cd: 3.5,  hp: 220,  atk: 60,  spd: 52,  range: 38,  aspd: 0.85, s: 1.05, axe: true, unlock: 0 },
  { id: "vaca",    name: "Gato Leão",         catType: "lion",   emoji: "🦁", color: "#ffffff", cost: 700,  cd: 4.5,  hp: 450,  atk: 55,  spd: 140, range: 34,  aspd: 0.45, s: 1.0,  turbo: true, lion: true, unlock: 300 },
  { id: "gordo",   name: "Gato Pernas Longas",catType: "legs",   emoji: "🦵", color: "#ffffff", cost: 400,  cd: 5.5,  hp: 240,  atk: 85,  spd: 32,  range: 260, aspd: 1.6,  s: 1.15, ranged: "kick", legs: true, unlock: 500 },
  { id: "passaro", name: "Gato Pássaro",      catType: "bird",   emoji: "🐦", color: "#ffffff", cost: 650,  cd: 6.0,  hp: 320,  atk: 75,  spd: 75,  range: 50,  aspd: 0.7,  s: 1.0,  fly: true, unlock: 800 },
  { id: "peixe",   name: "Gato Baleia/Peixe", catType: "fish",   emoji: "🐟", color: "#ffffff", cost: 800,  cd: 7.0,  hp: 750,  atk: 120, spd: 42,  range: 42,  aspd: 1.1,  s: 1.25, fin: true, unlock: 1200 },
  { id: "lagarto", name: "Gato Dragão",       catType: "dragon", emoji: "🐉", color: "#ffffff", cost: 1200, cd: 9.0,  hp: 450,  atk: 190, spd: 30,  range: 340, aspd: 2.0,  s: 1.3,  ranged: "fire", dragon: true, unlock: 1800 },
  { id: "tita",    name: "Gato Titã Mítico",  catType: "titan",  emoji: "👊", color: "#ffffff", cost: 1800, cd: 14.0, hp: 3800, atk: 320, spd: 18,  range: 65,  aspd: 2.2,  s: 2.3,  aoe: 180, big: true, unlock: 3000 }
];

// ---- Inimigos (The Battle Cats authentic roster) ----
const ENEMIES = {
  palito:   { name: "Boneco Palito",     emoji: "🏃", hp: 60,   atk: 10,  spd: 52, range: 30, aspd: 0.9,  s: 0.9,  reward: 20 },
  rato:     { name: "Snache (Cobra)",    emoji: "🐍", hp: 95,   atk: 15,  spd: 48, range: 32, aspd: 0.9,  s: 0.85, reward: 30 },
  caramelo: { name: "Doge (Cachorro)",   emoji: "🐕", hp: 320,  atk: 28,  spd: 45, range: 34, aspd: 1.1,  s: 1.1,  reward: 70 },
  pomba:    { name: "Pomba Hipster",     emoji: "🕊️", hp: 160,  atk: 18,  spd: 75, range: 30, aspd: 0.8,  s: 0.8,  reward: 45, fly: true },
  javali:   { name: "Hipopótamo Hippoe", emoji: "🦛", hp: 1200, atk: 75,  spd: 32, range: 38, aspd: 1.4,  s: 1.3,  reward: 180 },
  urso:     { name: "Professor Urso",    emoji: "🐻", hp: 3400, atk: 120, spd: 24, range: 50, aspd: 1.8,  s: 1.85, reward: 450, boss: true },
  gorila:   { name: "Gorila Supremo",    emoji: "🦍", hp: 8500, atk: 220, spd: 22, range: 55, aspd: 2.0,  s: 2.4,  reward: 1200, boss: true }
};

// ---- Fases (3 capítulos × 4 fases) ----
const CHAPTERS = [
  { name: "🌏 Capítulo 1: O Império dos Gatos" },
  { name: "🏙️ Capítulo 2: Metrópoles do Mundo" },
  { name: "🌌 Capítulo 3: O Vórtice Sombrio" }
];

const STAGES = [
  // Capítulo 1
  { ch: 0, name: "Coréia",          baseHp: 3000,  mul: 1.0,  rules: [{ t0: 1, every: 6.0, type: "palito" }, { t0: 5, every: 7.5, type: "rato" }] },
  { ch: 0, name: "China",           baseHp: 6000,  mul: 1.1,  rules: [{ t0: 1, every: 4.5, type: "palito" }, { t0: 4, every: 6.0, type: "rato" }, { t0: 12, every: 11, type: "caramelo" }] },
  { ch: 0, name: "Mongólia",        baseHp: 10000, mul: 1.25, rules: [{ t0: 1, every: 4.0, type: "rato" }, { t0: 7, every: 8.0, type: "caramelo" }, { t0: 18, every: 14, type: "javali" }] },
  { ch: 0, name: "Japão (Chefe)",   baseHp: 18000, mul: 1.4,  rules: [{ t0: 1, every: 3.5, type: "rato" }, { t0: 8, every: 7.0, type: "caramelo" }], events: [{ t: 35, type: "urso" }] },
  
  // Capítulo 2
  { ch: 1, name: "França",          baseHp: 22000, mul: 1.6,  rules: [{ t0: 1, every: 3.5, type: "palito" }, { t0: 5, every: 6.5, type: "caramelo" }, { t0: 12, every: 9.0, type: "pomba" }] },
  { ch: 1, name: "Alemanha",        baseHp: 26000, mul: 1.8,  rules: [{ t0: 1, every: 3.2, type: "caramelo" }, { t0: 10, every: 8.5, type: "javali" }] },
  { ch: 1, name: "Reino Unido",     baseHp: 30000, mul: 2.0,  rules: [{ t0: 1, every: 3.0, type: "pomba" }, { t0: 8, every: 7.0, type: "caramelo" }, { t0: 18, every: 12, type: "javali" }] },
  { ch: 1, name: "EUA (Invasão)",   baseHp: 38000, mul: 2.3,  rules: [{ t0: 1, every: 3.0, type: "caramelo" }, { t0: 10, every: 8.0, type: "javali" }], events: [{ t: 40, type: "urso" }, { t: 45, type: "urso" }] },

  // Capítulo 3
  { ch: 2, name: "Vórtice Espacial", baseHp: 45000, mul: 2.6, rules: [{ t0: 1, every: 2.8, type: "caramelo" }, { t0: 8, every: 6.5, type: "javali" }, { t0: 15, every: 8.0, type: "pomba" }] },
  { ch: 2, name: "Dimensão Negra",   baseHp: 52000, mul: 3.0, rules: [{ t0: 1, every: 2.5, type: "rato" }, { t0: 6, every: 5.5, type: "caramelo" }, { t0: 14, every: 7.5, type: "javali" }] },
  { ch: 2, name: "Abismo do Luar",   baseHp: 60000, mul: 3.4, rules: [{ t0: 1, every: 2.2, type: "caramelo" }, { t0: 8, every: 6.0, type: "javali" }], events: [{ t: 45, type: "urso" }] },
  { ch: 2, name: "LUA: GORILA SUPREMO", baseHp: 75000, mul: 4.0, rules: [{ t0: 1, every: 2.0, type: "caramelo" }, { t0: 6, every: 5.0, type: "javali" }], events: [{ t: 55, type: "gorila" }] }
];

// Recompensas por fase
function stageRewards(idx, firstClear){
  const f = firstClear ? 1 : 0.35;
  return {
    fish: Math.round((200 + idx * 90) * f),
    xp: Math.round((180 + idx * 80) * f)
  };
}

// Multiplicador por nível do gato (+10% por nível)
const levelMult = lvl => 1 + 0.10 * (lvl - 1);
// Custo de XP para melhorar (nível atual -> próximo)
const upgradeCost = lvl => lvl * 150;
const MAX_LEVEL = 10;
