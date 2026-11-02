import {riverY,surfaceAt} from './battle-scene.js';

const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};

let canopyCache=null;
const canopyZones={
  forest:[[125,150,115,90],[430,90,120,70],[1460,165,115,95],[1510,580,75,105],[110,690,85,95]],
  river:[[115,155,105,85],[420,100,120,70],[1470,155,105,95],[1510,625,75,95],[80,670,70,90]],
  mountain:[[200,145,140,95],[455,95,105,70],[1460,150,115,90],[90,630,75,100],[1510,600,75,95]],
  snow:[[165,150,115,90],[435,95,105,70],[1410,135,110,90],[90,625,75,95],[1510,600,75,100]],
};

export function drawCanopySway(ctx,scene,im,crop,time){
  const zones=canopyZones[scene.biome];
  if(!zones||!im.complete||!im.naturalWidth)return;
  const key=`${scene.id}:${im.src}:${crop.sx}:${crop.sy}:${crop.zoom}`;
  if(canopyCache?.key!==key){
    const patches=[];
    for(const [cx,cy,rx,ry] of zones){
      const x=Math.max(0,cx-rx),y=Math.max(0,cy-ry),w=Math.min(1600-x,rx*2),h=Math.min(900-y,ry*2);
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      const layer=canvas.getContext('2d',{willReadFrequently:true});
      layer.drawImage(im,(crop.sx+x/crop.zoom)*im.naturalWidth/1600,(crop.sy+y/crop.zoom)*im.naturalHeight/900,w/crop.zoom*im.naturalWidth/1600,h/crop.zoom*im.naturalHeight/900,0,0,w,h);
      const pixels=layer.getImageData(0,0,w,h),data=pixels.data;
      for(let py=0;py<h;py++)for(let px=0;px<w;px++){
        const dx=(x+px-cx)/rx,dy=(y+py-cy)/ry,r=Math.hypot(dx,dy);
        const fade=Math.max(0,Math.min(1,(1-r)/.48));
        data[(py*w+px)*4+3]*=fade*fade*(3-2*fade);
      }
      layer.putImageData(pixels,0,0);
      patches.push({canvas,x,y});
    }
    canopyCache={key,patches};
  }
  canopyCache.patches.forEach((patch,i)=>{
    const sway=Math.sin(time*(.85+scene.breeze*.2)+i*1.45+scene.seed);
    const lift=Math.cos(time*.7+i*1.8+scene.seed);
    ctx.drawImage(patch.canvas,patch.x+sway*(2.2+i%3*.4)*scene.wind,patch.y+lift*.8);
  });
}

function mist(ctx,time,tint='219,230,226'){
  ctx.save();
  for(let i=0;i<3;i++){
    const x=((time*(10+i*3)+i*530)%2150)-300,y=120+i*280;
    const g=ctx.createRadialGradient(x,y,10,x,y,260);
    g.addColorStop(0,`rgba(${tint},.075)`);g.addColorStop(1,`rgba(${tint},0)`);
    ctx.fillStyle=g;ctx.fillRect(x-260,y-220,520,440);
  }
  ctx.restore();
}

function leaves(ctx,scene,time){
  const tint=scene.biome==='snow'?'#b9c8b6':scene.biome==='desert'?'#c5a579':scene.variant===2?'#c19b52':'#83a260';
  ctx.save();
  for(let i=0;i<104;i++){
    const seed=scene.seed*73+i*19,side=i%4;
    const rootX=side===0?hash(seed)*315:side===1?1270+hash(seed)*330:hash(seed)*1600;
    const rootY=side===2?hash(seed+1)*155:side===3?690+hash(seed+1)*210:hash(seed+1)*900;
    const bend=Math.sin(time*(1.5+scene.breeze*.5)+seed)* (6+hash(seed+2)*7);
    const flutter=Math.sin(time*3.1+i)*.22;
    const x=rootX+bend,y=rootY+Math.cos(time*1.4+seed)*2;
    ctx.strokeStyle='rgba(36,56,34,.17)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(rootX,rootY+6);ctx.lineTo(x,y);ctx.stroke();
    ctx.globalAlpha=.29+hash(seed+3)*.35;ctx.fillStyle=tint;
    ctx.beginPath();ctx.ellipse(x,y,3+hash(seed+4)*4,1.4+hash(seed+5)*1.7,flutter+hash(seed+6)*2,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

function current(ctx,scene,time){
  ctx.save();ctx.lineCap='round';
  for(let i=0;i<90;i++){
    const p=(hash(scene.seed*10+i*7)+time*(.018+hash(i+7)*.012))%1;
    const x=70+p*1480,y=riverY(scene,x)+(hash(i*17+scene.seed)-.5)*82;
    const size=7+hash(i+32)*22;
    ctx.strokeStyle=i%8===0?'rgba(235,250,250,.42)':'rgba(204,231,232,.18)';
    ctx.lineWidth=.7+hash(i+8)*1.3;
    ctx.beginPath();ctx.moveTo(x-size/2,y);ctx.quadraticCurveTo(x,y-2.5,x+size/2,y-1);ctx.stroke();
  }
  ctx.restore();
}

function snow(ctx,time,sceneSeed=1,density=78){
  ctx.save();ctx.fillStyle='#edf7ff';
  for(let i=0;i<density;i++){
    const x=(hash(i+sceneSeed*13)*1660+time*(5+hash(i+45)*8)+Math.sin(time*.7+i)*15+1660)%1660-30;
    const y=(hash(i*3+8)*930+time*(16+hash(i+12)*22))%930;
    ctx.globalAlpha=.28+hash(i+20)*.5;
    ctx.beginPath();ctx.arc(x,y,.8+hash(i+11)*1.6,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

function flame(ctx,x,y,time,size=1){
  const pulse=.83+.17*Math.sin(time*9+x),radius=43*size;
  const light=ctx.createRadialGradient(x,y,0,x,y,radius);
  light.addColorStop(0,'rgba(255,175,54,.29)');light.addColorStop(1,'rgba(255,145,25,0)');
  ctx.fillStyle=light;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);
  for(let i=0;i<3;i++){
    const wave=Math.sin(time*7+i*2+x)*3;
    ctx.fillStyle=i===1?'rgba(255,226,119,.8)':'rgba(255,112,32,.73)';
    ctx.beginPath();ctx.moveTo(-5+i*4,5);ctx.quadraticCurveTo(-8+i*4+wave,-6,-2+i*4+wave,-18*pulse);ctx.quadraticCurveTo(5+i*3+wave,-5,4+i*4,5);ctx.fill();
  }
  ctx.restore();
}

function flag(ctx,x,y,time,color,wind=1){
  const wave=Math.sin(time*3.2+x*.03)*6*wind;
  ctx.save();ctx.lineWidth=2;ctx.strokeStyle='rgba(28,28,27,.78)';
  ctx.beginPath();ctx.moveTo(x,y+39);ctx.lineTo(x,y-23);ctx.stroke();
  ctx.fillStyle=color;ctx.globalAlpha=.8;
  ctx.beginPath();ctx.moveTo(x,y-21);ctx.quadraticCurveTo(x+17,y-25+wave*.35,x+34+wave,y-11+wave*.4);ctx.quadraticCurveTo(x+18,y-8+wave*.4,x,y-4);ctx.closePath();ctx.fill();ctx.restore();
}

function obstacle(ctx,o,biome,time){
  ctx.save();ctx.translate(o.x,o.y);
  ctx.fillStyle='rgba(23,25,21,.31)';ctx.beginPath();ctx.ellipse(4,7,o.radius*1.35,o.radius*.37,0,0,Math.PI*2);ctx.fill();
  if(o.kind==='tree'){
    ctx.fillStyle='#352e22';ctx.fillRect(-3,-o.radius*1.5,6,o.radius*1.5);
    for(let i=0;i<12;i++){
      const px=(hash(i*13+o.x)-.5)*o.radius*2,py=-o.radius*1.5+(hash(i*17+o.y)-.5)*o.radius;
      const shift=Math.sin(time*1.7+i+o.x)*5;
      ctx.fillStyle=i%3?'rgba(67,98,52,.6)':'rgba(100,126,62,.55)';
      ctx.beginPath();ctx.ellipse(px+shift,py,7,3,shift*.025,0,Math.PI*2);ctx.fill();
    }
  }else if(o.kind==='log'){
    ctx.rotate(-.2);ctx.fillStyle='#514536';ctx.fillRect(-o.radius,-7,o.radius*2,14);
    ctx.strokeStyle='#8a7960';ctx.lineWidth=2;ctx.strokeRect(-o.radius,-7,o.radius*2,14);
  }else{
    ctx.fillStyle=biome==='snow'?'#b7c4c3':biome==='desert'?'#a48b67':'#737b72';
    ctx.beginPath();ctx.moveTo(-o.radius,0);ctx.lineTo(-o.radius*.6,-o.radius*.5);ctx.lineTo(o.radius*.25,-o.radius*.72);ctx.lineTo(o.radius,-o.radius*.12);ctx.lineTo(o.radius*.65,o.radius*.25);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(234,231,207,.22)';ctx.lineWidth=2;ctx.stroke();
    if(biome==='snow'){ctx.fillStyle='rgba(244,249,251,.78)';ctx.beginPath();ctx.ellipse(-3,-o.radius*.58,o.radius*.44,3,-.15,0,Math.PI*2);ctx.fill()}
  }
  ctx.restore();
}

export function drawBattleEnvironment(ctx,scene,time){
  if(scene.foliage||scene.dust||scene.snow)leaves(ctx,scene,time);
  if(scene.water)current(ctx,scene,time);
  if(scene.snow)snow(ctx,time,scene.seed,220);
  if(scene.biome==='forest'||scene.biome==='mountain'||scene.snow)mist(ctx,time,scene.snow?'230,239,248':'219,230,226');
  // Never paint vector rocks or logs over the illustrated terrain: they read
  // as flat grey polygons and do not match the photographed perspective.
  if(scene.terrain==='city'){
    const tone=scene.snow?'#b6c7d0':scene.dust?'#b4794f':'#a33f31';
    for(let i=0;i<Math.min(4,2+Math.floor(scene.seed/12));i++)flag(ctx,850+i*110,220+(i%2)*50,time,tone,scene.wind);
    for(const [x,y] of [[775,245],[1080,315],[1250,270]])flame(ctx,x+(scene.seed%3)*13,y,time,.65);
  }
}

export class BattleEffects{
  constructor(){this.particles=[];this.accumulator=0}
  reset(){this.particles.length=0;this.accumulator=0}
  update(dt){for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt}this.particles=this.particles.filter(p=>p.life>0)}
  movement(scene,x,y,dt,count=1,horse=false){
    const ground=surfaceAt(scene,x,y),surface=horse&&ground==='ground'?'sand':ground;
    const chance=surface==='water'?10:surface==='sand'?horse?12:6:surface==='snow'?4:1.5;
    this.accumulator+=dt*chance*Math.min(count,3);
    while(this.accumulator>=1){this.accumulator--;this.burst(surface,x+(Math.random()-.5)*30,y,1)}
  }
  impact(scene,x,y){this.burst(surfaceAt(scene,x,y),x,y,7)}
  burst(surface,x,y,count){
    const kind=surface==='water'?'splash':surface==='sand'?'dust':surface==='snow'?'powder':'leaf';
    for(let i=0;i<count;i++){
      const theta=Math.random()*Math.PI*2,speed=kind==='splash'?28+Math.random()*55:12+Math.random()*32;
      this.particles.push({kind,x,y,vx:Math.cos(theta)*speed,vy:Math.sin(theta)*speed-(kind==='splash'?38:15),gravity:kind==='splash'?120:kind==='dust'?-5:12,life:.35+Math.random()*.55,maxLife:.9,size:kind==='dust'?12+Math.random()*17:1.5+Math.random()*3});
    }
    if(this.particles.length>200)this.particles.splice(0,this.particles.length-200);
  }
  draw(ctx){
    ctx.save();
    for(const p of this.particles){
      const a=Math.max(0,p.life/p.maxLife);
      if(p.kind==='dust'||p.kind==='powder'){
        const color=p.kind==='dust'?'204,166,111':'232,240,245';
        const r=p.size*(1.25-a*.5),g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
        g.addColorStop(0,`rgba(${color},${.2*a})`);g.addColorStop(1,`rgba(${color},0)`);
        ctx.fillStyle=g;ctx.fillRect(p.x-r,p.y-r,r*2,r*2);
      }else{
        ctx.fillStyle=p.kind==='splash'?`rgba(221,246,250,${.62*a})`:`rgba(147,168,88,${.42*a})`;
        ctx.beginPath();ctx.ellipse(p.x,p.y,p.size,p.kind==='splash'?p.size*1.4:p.size*.5,0,0,Math.PI*2);ctx.fill();
      }
    }
    ctx.restore();
  }
}

function chimneySmoke(ctx,x,y,time,seed=0,strength=1){
  ctx.save();
  for(let i=0;i<8;i++){
    const age=(time*.22+i/8+seed)%1,px=x+age*28+Math.sin(time*1.4+i)*5,py=y-age*95;
    const radius=(4+age*16)*strength,g=ctx.createRadialGradient(px,py,0,px,py,radius);
    g.addColorStop(0,`rgba(217,222,216,${Math.min(.34,.17*strength)*(1-age)})`);g.addColorStop(1,'rgba(217,222,216,0)');
    ctx.fillStyle=g;ctx.fillRect(px-radius,py-radius,radius*2,radius*2);
  }
  ctx.restore();
}
function homeWaterfall(ctx,time){
  // Keep the castle image fixed; moving highlights stay inside the painted falls.
  ctx.save();ctx.lineCap='round';
  for(const fall of [{x:164,y:191,w:47,h:151},{x:19,y:728,w:37,h:88}]){
    ctx.beginPath();ctx.rect(fall.x,fall.y,fall.w,fall.h);ctx.clip();
    for(let i=0;i<18;i++){
      const x=fall.x+((i*19)%fall.w),y=fall.y+((time*(35+i%4*7)+i*31)%fall.h);
      ctx.strokeStyle=`rgba(228,242,244,${.06+(i%3)*.025})`;ctx.lineWidth=1+i%2*.5;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+16+i%4*5);ctx.stroke();
    }
    ctx.restore();ctx.save();
  }
  ctx.restore();
}
export function drawHomeEnvironment(ctx,time){
  homeWaterfall(ctx,time);
  mist(ctx,time);
  for(const [x,y,s] of [[318,590,.48],[279,678,.32],[375,716,.32],[744,293,.4],[790,300,.4],[685,356,.25],[731,380,.25],[1248,386,.75],[1122,383,.45],[1319,316,.35],[1311,262,.22],[361,405,.3],[215,454,.25],[750,476,.25],[811,520,.26],[828,687,.32],[890,687,.28],[1187,623,.22]])flame(ctx,x,y,time,s);
  chimneySmoke(ctx,865,576,time,0,1.9);chimneySmoke(ctx,1306,281,time,.43);chimneySmoke(ctx,437,316,time,.2);
  flag(ctx,803,310,time,'#315a9c');flag(ctx,1088,247,time,'#315a9c');
}

export function drawMapEnvironment(ctx,time){
  ctx.save();ctx.beginPath();ctx.rect(0,0,1600,245);ctx.clip();snow(ctx,time,4,26);ctx.restore();
}
