import {MusicDirector} from './music.js';

const FILES = {
  bow: '/audio/bow.wav', whoosh: '/audio/arrow-whoosh.wav',
  sword1: '/audio/sword-clash-1.ogg', sword2: '/audio/sword-clash-2.ogg', sword3: '/audio/sword-clash-3.ogg',
  gallop: '/audio/horse-gallop.mp3', neigh: '/audio/horse-neigh.mp3',
  stone: '/audio/tower-stone.ogg',
  forest: '/audio/forest-ambience.mp3', river: '/audio/river-stream.ogg', waterfall: '/audio/river-waterfall.ogg', wind: '/audio/wind-ambience.mp3',
  sand: '/audio/sand-steps.mp3',
  cityInfantry: '/audio/city-infantry.ogg', cityBarracks: '/audio/city-barracks.ogg',
  cityForge: '/audio/city-forge.ogg', cityGranary: '/audio/city-granary.ogg',
  cityHarvest: '/audio/city-harvest.ogg', cityError: '/audio/city-error.ogg', cityPanel: '/audio/city-panel.ogg',
};

export class BattleAudio {
  constructor() {
    this.context = null;
    this.buffers = new Map();
    this.loading = null;
    this.enabled = true;
    this.terrain = null;
    this.terrainVariant = 0;
    this.ambient = [];
    this.last = new Map();
    this.swordIndex = 0;
    this.music = new MusicDirector();
  }

  async unlock() {
    this.music.unlock();
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = this.enabled ? .36 : 0;
      this.master.connect(this.context.destination);
    }
    await this.context.resume();
    if (!this.loading) this.loading = Promise.all(Object.entries(FILES).map(async ([key, url]) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(String(response.status));
        const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
        this.buffers.set(key, ['forest','river','waterfall','wind'].includes(key) ? this.makeSeamless(buffer) : buffer);
      } catch (error) { console.warn('Ses yüklenemedi:', key, error); }
    })).then(() => this.setTerrain(this.terrain, true, this.terrainVariant));
    return this.loading;
  }

  setEnabled(value) {
    this.enabled = value;
    if (this.context && this.master) this.master.gain.setTargetAtTime(value ? .36 : 0, this.context.currentTime, .08);
    this.music.setEnabled(value);
    if (value) this.unlock().then(() => this.setTerrain(this.terrain, true, this.terrainVariant));
  }

  makeSeamless(buffer) {
    const data=buffer.getChannelData(0), block=Math.max(128,Math.floor(buffer.sampleRate*.012));
    let peak=0;
    for(let i=0;i<data.length;i++)peak=Math.max(peak,Math.abs(data[i]));
    const threshold=peak*.045, maxTrim=Math.floor(data.length*.28);
    const loud=(from)=>{let energy=0;for(let i=from;i<Math.min(data.length,from+block);i++)energy+=Math.abs(data[i]);return energy/block>threshold};
    let start=0,end=data.length;
    while(start<maxTrim&&!loud(start))start+=block;
    while(end>data.length-maxTrim&&!loud(Math.max(0,end-block)))end-=block;
    start=Math.max(0,start-Math.floor(buffer.sampleRate*.025));
    end=Math.min(data.length,end+Math.floor(buffer.sampleRate*.025));
    const length=end-start,fade=Math.min(Math.floor(buffer.sampleRate*.34),Math.floor(length/7));
    if(length<buffer.sampleRate*.5||fade<16)return buffer;
    const result=this.context.createBuffer(buffer.numberOfChannels,length-fade,buffer.sampleRate);
    for(let ch=0;ch<buffer.numberOfChannels;ch++){
      const input=buffer.getChannelData(ch),output=result.getChannelData(ch),body=length-2*fade;
      for(let i=0;i<body;i++)output[i]=input[start+fade+i];
      for(let i=0;i<fade;i++){const t=(i+1)/(fade+1);output[body+i]=input[start+length-fade+i]*(1-t)+input[start+i]*t}
    }
    return result;
  }

  sample(name, volume = .3, rate = 1, delay = 0, loop = false) {
    if (!this.enabled || !this.context || this.context.state !== 'running') return null;
    const buffer = this.buffers.get(name);
    if (!buffer) return null;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    source.loop = loop;
    gain.gain.value = volume;
    source.connect(gain).connect(this.master);
    source.start(this.context.currentTime + delay);
    return { source, gain };
  }

  cue(kind) {
    if (!this.enabled || !this.context) return;
    const now = this.context.currentTime;
    const cooldown = { arrow: .22, sword: .18, gallop: 2.4, neigh: 8, stone: .6, sand: 2.8 }[kind] || .1;
    if (now - (this.last.get(kind) ?? -100) < cooldown) return;
    this.last.set(kind, now);
    if (kind === 'arrow') {
      this.sample('bow', .34, .94 + Math.random() * .12);
      this.sample('whoosh', .15, .88 + Math.random() * .20, .12);
    } else if (kind === 'sword') {
      const names = ['sword1', 'sword2', 'sword3'];
      this.sample(names[this.swordIndex++ % names.length], .32, .9 + Math.random() * .2);
    } else if (kind === 'gallop') this.sample('gallop', .22, .95 + Math.random() * .1);
    else if (kind === 'neigh') this.sample('neigh', .20, .9 + Math.random() * .15);
    else if (kind === 'stone') this.sample('stone', .32, .82 + Math.random() * .14);
    else if (kind === 'sand') this.sample('sand', .14, .96 + Math.random() * .08);
  }

  cityCue(action, success=true) {
    if(!success){this.sample('cityError',.24);return}
    const sounds={archer:['bow',.24],infantry:['cityInfantry',.28],cavalry:['gallop',.24],
      armor:['sword1',.30],barracks:['cityBarracks',.29],forge:['cityForge',.29],
      granary:['cityGranary',.26],harvest:['cityHarvest',.27],panel:['cityPanel',.23]};
    const [name,volume]=sounds[action]||sounds.panel;
    this.sample(name,volume,.96+Math.random()*.07);
  }

  stopMusic() {
    this.music.set(null);
  }

  setBattleMusic(kind) {
    this.music.set(kind);
  }

  setTerrain(terrain, force = false, variant = 0) {
    if (!force && terrain === this.terrain && variant === this.terrainVariant) return;
    this.terrain = terrain;
    this.terrainVariant = variant;
    for (const old of this.ambient) {
      if (this.context) {
        old.gain.gain.setTargetAtTime(0, this.context.currentTime, .18);
        try { old.source.stop(this.context.currentTime + 1); } catch {}
      }
    }
    this.ambient = [];
    if (!terrain || !this.enabled || !this.context || !this.buffers.size) return;
    const layers = terrain === 'river' ? (variant===2?[['waterfall', .17], ['river', .075]]:[['river', .21], ['wind', .025]])
      : terrain === 'forest' || terrain === 'home' ? [['forest', .16]]
        : terrain === 'snow' ? [['wind', .17]]
          : terrain === 'desert' ? [['wind', .13]]
            : terrain === 'mountain' ? [['wind', .16]] : [['wind', .11]];
    for (const [name, level] of layers) {
      const playing = this.sample(name, 0, terrain === 'city' ? .9 : 1, 0, true);
      if (playing) {
        playing.gain.gain.setTargetAtTime(level, this.context.currentTime, .4);
        this.ambient.push(playing);
      }
    }
  }
}
