"use strict";

// ===== Efeitos Sonoros Sintetizados: The Battle Cats =====

const Sfx = {
  ctx: null,
  noiseBuf: null,
  _lastThud: 0,

  init(){
    if(!this.ctx){
      try{
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }catch(e){ return; }
    }
    if(this.ctx.state === "suspended") this.ctx.resume();
  },

  getNoise(){
    if(!this.noiseBuf && this.ctx){
      const len = Math.floor(this.ctx.sampleRate * 0.4);
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for(let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return this.noiseBuf;
  },

  noise(dur, freq, type, vol){
    if(!this.ctx) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.getNoise();
    const f = this.ctx.createBiquadFilter();
    f.type = type || "lowpass";
    f.frequency.value = freq;
    f.Q.value = 1.5;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol || 0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.ctx.destination);
    src.start(t);
    src.stop(t + dur);
  },

  tone(freq, delay, dur, type, vol){
    if(!this.ctx) return;
    const t = this.ctx.currentTime + (delay || 0);
    const o = this.ctx.createOscillator();
    o.type = type || "square";
    o.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(t);
    o.stop(t + dur);
  },

  click(){ this.tone(720, 0, 0.04, "sine", 0.08); },
  coin(){
    this.tone(980, 0, 0.06, "sine", 0.12);
    this.tone(1480, 0.06, 0.09, "sine", 0.12);
  },
  spawn(){
    this.tone(520, 0, 0.05, "sine", 0.15);
    this.tone(880, 0.04, 0.08, "triangle", 0.15);
  },
  workerUpgrade(){
    this.tone(523, 0, 0.08, "sine", 0.14);
    this.tone(659, 0.08, 0.08, "sine", 0.14);
    this.tone(784, 0.16, 0.12, "triangle", 0.16);
  },
  cannonReady(){
    this.tone(1046, 0, 0.08, "sine", 0.15);
    this.tone(1318, 0.08, 0.15, "triangle", 0.18);
  },
  thud(){
    const now = performance.now();
    if(now - this._lastThud < 60) return;
    this._lastThud = now;
    this.noise(0.08, 280, "lowpass", 0.18);
    this.tone(120, 0, 0.06, "sine", 0.15);
  },
  baseHit(){
    this.noise(0.18, 160, "lowpass", 0.3);
    this.tone(80, 0, 0.15, "sawtooth", 0.2);
  },
  kb(){
    this.tone(420, 0, 0.06, "square", 0.12);
    this.tone(260, 0.05, 0.1, "square", 0.12);
  },
  laser(){
    if(!this.ctx) return;
    const t = this.ctx.currentTime;
    // Som subindo de carga sci-fi
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(1800, t + 0.15);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(t);
    o.stop(t + 0.25);
    // Explosão grave retumbante do canhão
    this.noise(0.6, 120, "lowpass", 0.45);
  },

  mew(){
    if(!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(650, t);
    o.frequency.linearRampToValueAtTime(1050, t + 0.06);
    o.frequency.linearRampToValueAtTime(520, t + 0.18);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(t);
    o.stop(t + 0.2);
  },

  meow(pain){
    if(!this.ctx) return;
    const t = this.ctx.currentTime;
    const curve = pain
      ? [[0, 750], [0.06, 1200], [0.16, 850], [0.3, 500]]
      : [[0, 450], [0.1, 780], [0.28, 650], [0.55, 380]];
    const dur = pain ? 0.32 : 0.6;
    const o1 = this.ctx.createOscillator(); o1.type = "sawtooth";
    const o2 = this.ctx.createOscillator(); o2.type = "triangle";
    const filt = this.ctx.createBiquadFilter(); filt.type = "lowpass"; filt.Q.value = 3.5;
    const g = this.ctx.createGain();
    for(const o of [o1, o2]){
      o.frequency.setValueAtTime(curve[0][1], t);
      for(let i = 1; i < curve.length; i++){
        o.frequency.exponentialRampToValueAtTime(curve[i][1], t + curve[i][0]);
      }
    }
    filt.frequency.setValueAtTime(750, t);
    filt.frequency.linearRampToValueAtTime(1600, t + 0.18);
    filt.frequency.linearRampToValueAtTime(600, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.06);
    g.gain.setValueAtTime(0.14, t + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o1.connect(filt); o2.connect(filt); filt.connect(g); g.connect(this.ctx.destination);
    o1.start(t); o2.start(t);
    o1.stop(t + dur); o2.stop(t + dur);
  },

  jingle(win){
    const notes = win ? [523, 659, 784, 1047, 1319] : [440, 349, 294, 233];
    notes.forEach((f, i) => this.tone(f, i * 0.13, 0.15, "triangle", 0.15));
  }
};
