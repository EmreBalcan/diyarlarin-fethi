export const MUSIC_TRACKS = {
  army: './audio/music-army.mp3', city: './audio/music-city.mp3',
  home: './audio/music-home.mp3', map: './audio/music-map.mp3',
};

// Two preloaded players per song overlap at the loop seam. Screen changes
// use a separate envelope so leaving during a loop also fades both players.
export class MusicDirector {
  constructor({createAudio=url=>new Audio(url), now=()=>performance.now(), schedule=fn=>setInterval(fn,50), cancel=id=>clearInterval(id)}={}) {
    this.createAudio=createAudio;this.now=now;this.schedule=schedule;this.cancel=cancel;
    this.groups=new Map();this.kind=null;this.enabled=true;this.unlocked=false;this.timer=null;this.lastTick=0;
    // Release mix: keep the new background music a quarter quieter while
    // preserving combat and environment effect levels.
    this.volume=.1125;this.fadeSeconds=1.2;this.loopSeconds=2.6;
  }
  prepare(kind) {
    if(!MUSIC_TRACKS[kind])return null;
    if(!this.groups.has(kind)){
      const players=[0,1].map(()=>{const p=this.createAudio(MUSIC_TRACKS[kind]);p.preload='auto';p.volume=0;p.load();return p});
      this.groups.set(kind,{players,active:0,gain:0,target:0,playing:false,pending:false,loop:null,token:0});
    }
    return this.groups.get(kind);
  }
  unlock(){this.unlocked=true;this.set(this.kind)}
  setEnabled(value){this.enabled=value;this.set(this.kind)}
  set(kind){
    this.kind=MUSIC_TRACKS[kind]?kind:null;
    for(const [name,g] of this.groups)g.target=this.enabled&&this.unlocked&&name===this.kind?1:0;
    const g=this.prepare(this.kind);
    if(g&&this.enabled&&this.unlocked){g.target=1;if(!g.playing&&!g.pending)this.start(g)}
    if(!this.timer&&(g||[...this.groups.values()].some(q=>q.gain>0))){this.lastTick=this.now();this.timer=this.schedule(()=>this.tick())}
  }
  start(g){
    const token=++g.token;g.pending=true;
    Promise.resolve(g.players[g.active].play()).then(()=>{
      if(token!==g.token)return;
      g.pending=false;g.playing=true;
      if(!g.target)this.silence(g);
    }).catch(()=>{if(token===g.token){g.pending=false;g.playing=false}});
  }
  silence(g){
    g.token++;g.pending=false;g.playing=false;g.loop=null;g.gain=0;
    for(const p of g.players){p.volume=0;p.pause();try{p.currentTime=0}catch{}}
    g.active=0;
  }
  tick(){
    const now=this.now(),dt=Math.min(.25,Math.max(0,(now-this.lastTick)/1000));this.lastTick=now;
    for(const g of this.groups.values()){
      if(!g.playing)continue;
      g.gain=g.target?Math.min(1,g.gain+dt/this.fadeSeconds):Math.max(0,g.gain-dt/this.fadeSeconds);
      if(!g.target&&g.gain===0){this.silence(g);continue}
      const a=g.players[g.active],b=g.players[1-g.active];
      if(g.loop){
        const progress=Math.min(1,(now-g.loop.started)/(this.loopSeconds*1000));
        a.volume=this.volume*g.gain*Math.cos(progress*Math.PI/2);
        b.volume=this.volume*g.gain*Math.sin(progress*Math.PI/2);
        if(progress>=1){a.pause();try{a.currentTime=0}catch{};a.volume=0;g.active=1-g.active;g.loop=null}
      }else{
        a.volume=this.volume*g.gain;b.volume=0;
        if(g.target&&!g.pending&&Number.isFinite(a.duration)&&a.duration>this.loopSeconds*2&&(a.duration-a.currentTime<=this.loopSeconds+.15||a.ended)){
          g.pending=true;const token=g.token;
          try{b.currentTime=0}catch{}
          Promise.resolve(b.play()).then(()=>{if(g.token!==token){b.pause();return}g.pending=false;if(!g.target){b.pause();return}g.loop={started:this.now()}}).catch(()=>{if(g.token===token)g.pending=false});
        }
      }
    }
    if(![...this.groups.values()].some(g=>g.playing||g.pending)){this.cancel(this.timer);this.timer=null}
  }
  dispose(){for(const g of this.groups.values())this.silence(g);this.cancel(this.timer);this.timer=null}
}
