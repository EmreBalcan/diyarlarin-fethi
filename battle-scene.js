const rand=(seed,n=0)=>{
  const v=Math.sin(seed*91.733+n*37.719)*43758.5453;
  return v-Math.floor(v);
};

export function makeBattleScene(encounter){
  const seed=encounter.sceneSeed,biome=encounter.kind==='city'?encounter.biome:encounter.terrain;
  const obstacleCount=encounter.kind==='city'?5:biome==='mountain'?11:biome==='desert'?7:9;
  const obstacles=[];
  for(let i=0;i<obstacleCount;i++){
    const side=i%4;
    const x=side===0?130+rand(seed,i)*245:side===1?1285+rand(seed,i)*205:250+rand(seed,i)*1100;
    const y=side===2?125+rand(seed,i+31)*140:side===3?670+rand(seed,i+31)*100:175+rand(seed,i+31)*565;
    const radius=18+rand(seed,i+71)*25;
    if((x<580&&y>320&&y<725)||(x>930&&y>155&&y<510))continue;
    obstacles.push({x,y,radius,kind:biome==='forest'&&i%3===0?'tree':biome==='desert'?'stone':biome==='snow'?'snowrock':i%4===0?'log':'stone'});
  }
  return {
    id:encounter.id,seed,biome,terrain:encounter.terrain,variant:encounter.variant||0,
    obstacles,wind:rand(seed,99)>.48?1:-1,
    breeze:.55+rand(seed,100)*.75,
    water:encounter.terrain==='river',
    dust:biome==='desert',snow:biome==='snow',
    foliage:biome==='forest'||biome==='river'||biome==='mountain',
    landmark:['fallen-log','standing-stones','old-cart','camp','boulder-field'][seed%5],
  };
}

export function riverY(scene,x){
  const t=x/1600;
  return scene.variant===0?210+480*t+Math.sin(t*7)*38:
    scene.variant===1?600-350*t+Math.sin(t*8)*28:
    165+390*t+Math.sin(t*7)*35;
}

export function surfaceAt(scene,x,y){
  if(scene.water&&Math.abs(y-riverY(scene,x))<55)return 'water';
  if(scene.dust)return 'sand';
  if(scene.snow)return 'snow';
  return 'ground';
}

export function isWalkable(scene,x,y){
  if(x<95||x>1510||y<115||y>775)return false;
  // The painted terrain already contains its own rocks and trees. Synthetic
  // collision shapes cannot be aligned with every illustration.
  return true;
}

export function nearestWalkable(scene,x,y){
  if(isWalkable(scene,x,y))return {x,y};
  for(let radius=28;radius<=280;radius+=28){
    for(let i=0;i<24;i++){
      const angle=i*Math.PI/12,p={x:x+Math.cos(angle)*radius,y:y+Math.sin(angle)*radius};
      if(isWalkable(scene,p.x,p.y))return p;
    }
  }
  return {x:Math.max(95,Math.min(1510,x)),y:Math.max(115,Math.min(775,y))};
}

export function advanceOnScene(scene,from,to,distance){
  const angle=Math.atan2(to.y-from.y,to.x-from.x);
  for(const turn of [0,.42,-.42,.85,-.85,1.35,-1.35]){
    const x=from.x+Math.cos(angle+turn)*distance,y=from.y+Math.sin(angle+turn)*distance;
    if(isWalkable(scene,x,y))return {x,y};
  }
  return {x:from.x,y:from.y};
}
