const REGIONS=['snow','forest','desert'];
const FORT_NAMES={snow:['Buz Sığınağı','Kuzey Kulesi','Ayaz Hisarı'],forest:['Yeni Çamburç','Vadi Kalesi','Yeşil Hisar'],desert:['Kum Hisarı','Vaha Kalesi','Güneş Kulesi']};
const ARMY_NAMES={snow:['Ayaz Devriyesi','Buz Akıncıları','Kuzey Sancağı'],forest:['Çam Devriyesi','Vadi Akıncıları','Orman Sancağı'],desert:['Kum Devriyesi','Vaha Akıncıları','Çöl Sancağı']};
export const WORLD_KEY='orman-savaslari-world-v1';

export function makeWorld(saved={}){
  return {turn:Math.max(0,saved.turn||0),serial:Math.max(0,saved.serial||0),focus:REGIONS.includes(saved.focus)?saved.focus:'forest',pressure:{snow:0,forest:0,desert:0,...saved.pressure},armies:Array.isArray(saved.armies)?saved.armies:[],cities:Array.isArray(saved.cities)?saved.cities:[],capturedAt:{...saved.capturedAt},lastReclaim:Math.max(0,saved.lastReclaim||0),raidSerial:Math.max(0,saved.raidSerial||0),raidQueue:Array.isArray(saved.raidQueue)?saved.raidQueue.map(raid=>({...raid})):[],pendingRaid:saved.pendingRaid?{...saved.pendingRaid}:null,lastRaidTurn:Math.max(0,saved.lastRaidTurn||0)};
}

export function playerWorldTier(city,victoryCount){
  const levels=Object.values(city.equipment||{}).flatMap(g=>[g.stars||1,g.weapon||1]);
  const gear=levels.length?Math.round(levels.reduce((sum,level)=>sum+level,0)/levels.length):1;
  return Math.min(5,Math.max(gear,1+Math.floor(victoryCount/6)));
}

export function recordConquest(previous,id){
  const world=makeWorld(previous);
  world.capturedAt[id]=world.turn;
  world.raidQueue=world.raidQueue.filter(r=>r.targetCityId!==id);
  const queued=world.raidQueue;
  const homeDue=Math.max(world.turn+4+world.raidSerial%2,...queued.filter(r=>r.kind==='home').map(r=>r.dueTurn+3),0);
  const cityDue=Math.max(world.turn+8+world.raidSerial%4,...queued.filter(r=>r.kind==='city').map(r=>r.dueTurn+4),0);
  queued.push({id:`baskin-${++world.raidSerial}`,kind:'home',sourceCityId:id,dueTurn:homeDue});
  queued.push({id:`baskin-${++world.raidSerial}`,kind:'city',sourceCityId:id,targetCityId:id,dueTurn:cityDue});
  return world;
}

export function isWorldConquered(encounters,victories){return encounters.length>0&&encounters.every(e=>victories.has(e.id))}

export function makeRaidEncounter(raid,target,city,victoryCount){
  const playerTotal=Object.values(city.roster).reduce((a,b)=>a+b,0),tier=playerWorldTier(city,victoryCount),home=raid.kind==='home';
  const total=home?Math.max(1,Math.min(playerTotal-1,Math.floor(playerTotal*(.38+(raid.dueTurn%3)*.05)))):Math.max(18,Math.round(playerTotal*(.72+(raid.dueTurn%4)*.18)));
  const level=home?Math.max(1,tier-1):Math.min(5,Math.max(target.level||1,tier+(raid.dueTurn%3===0?1:0)));
  const archers=Math.round(total*.28),cavalry=Math.round(total*.2),infantry=total-archers-cavalry;
  return {id:raid.id,kind:'raid',name:home?'Karargâh Baskını':`${target.name} Baskını`,biome:home?'forest':target.biome,terrain:home?'forest':target.biome,variant:0,sceneSeed:raid.dueTurn*73+raid.id.length*17,level,gear:{stars:level,weapon:level,armor:Math.max(0,level-1),arrows:level,shield:level,weaponStyle:'kılıç'},archers,infantry,cavalry,armored:Math.round(total*(home?.18:.4)),towers:0};
}

export function autoDefendRaid(raid,encounter,city){
  if(raid.kind==='home')return true;
  const defenders=Object.entries(city.roster).reduce((sum,[type,count])=>sum+count*(1+.19*((city.equipment[type]?.stars||1)-1)+.1*((city.equipment[type]?.weapon||1)-1)),0);
  const attackers=(encounter.archers+encounter.infantry+encounter.cavalry)*(1+.18*(encounter.level-1));
  return defenders>=attackers;
}

export function resolveRaid(previous,raid,defended){
  const world=makeWorld(previous),reclaimed=[];
  if(world.pendingRaid?.id!==raid.id)return {world,reclaimed};
  world.pendingRaid=null;world.lastRaidTurn=world.turn;
  if(raid.kind==='city'){
    if(defended)world.raidQueue.push({...raid,id:`baskin-${++world.raidSerial}`,dueTurn:world.turn+9+world.raidSerial%4});
    else{reclaimed.push(raid.targetCityId);world.raidQueue=world.raidQueue.filter(r=>r.targetCityId!==raid.targetCityId)}
  }
  return {world,reclaimed};
}

function makeArmy(world,biome,tier){
  const serial=world.serial+1,slot=serial*7+(biome==='snow'?1:biome==='desert'?3:0);
  const level=Math.max(1,Math.min(5,tier));
  const strength=28+level*11+(serial*17)%29;
  const archers=Math.round(strength*.28),cavalry=Math.round(strength*.18),infantry=strength-archers-cavalry;
  const terrain=biome==='forest'?['forest','river','mountain'][serial%3]:biome;
  const row=biome==='snow'?0:biome==='forest'?1:3;
  return {id:`yenilenen-${serial}`,kind:'army',biome,terrain,variant:serial%(terrain==='snow'?4:terrain==='mountain'?2:3),sceneSeed:800+serial*31,phase:serial*1.9,
    x:190+(slot%9)*150,y:142+row*142+Math.floor(slot/9%2)*60,name:`${ARMY_NAMES[biome][serial%3]} ${serial}`,level,quality:level,
    gear:{stars:level,weapon:level,armor:Math.max(0,level-1),arrows:level,shield:level,weaponStyle:['kılıç','balta','mızrak'][serial%3]},
    archers,infantry,cavalry,armored:Math.round(infantry*.32+cavalry*.55),towers:0,age:0};
}

function foundCity(army,serial){
  const level=Math.max(3,army.level),strength=205+level*20;
  const archers=Math.round(strength*.25),cavalry=Math.round(strength*.17),infantry=strength-archers-cavalry;
  return {...army,id:`kurulan-sehir-${serial}`,kind:'city',name:`${FORT_NAMES[army.biome][serial%3]} ${serial}`,terrain:'city',cityVariant:serial%(army.biome==='snow'?3:5),level,quality:level,
    gear:{...army.gear,stars:level,weapon:level,armor:level-1},archers,infantry,cavalry,armored:Math.round(infantry*.5+cavalry*.7),towers:Math.min(6,level+1)};
}

export function advanceWorld(previous,{focus,city,victories,baseCities=[],baseArmies=[]}){
  const world=makeWorld(previous),held=new Set(victories),events=[];
  const known=[...baseCities,...baseArmies,...world.cities,...world.armies];
  const hostiles=known.filter(e=>!held.has(e.id)).length;
  const closingCampaign=baseCities.length>0&&hostiles<=5;
  world.turn++;
  if(REGIONS.includes(focus))world.focus=focus;
  for(const region of REGIONS)world.pressure[region]=region===world.focus?Math.max(0,world.pressure[region]-3):Math.min(30,world.pressure[region]+1);
  const tier=playerWorldTier(city,held.size),cap=Math.min(5,tier+(held.size>=8?1:0));
  world.armies=world.armies.filter(a=>!held.has(a.id)).map(a=>{
    const age=(a.age||0)+1,level=age%4===0&&world.pressure[a.biome]>=4?Math.min(cap,a.level+1):a.level;
    const room=Math.max(0,65+tier*55-(a.archers+a.infantry+a.cavalry));
    const extra=Math.min(room,world.pressure[a.biome]>=4?3+Math.floor(tier*1.5):1);
    return {...a,age,level,quality:level,gear:{...a.gear,stars:level,weapon:level,armor:Math.max(0,level-1),arrows:level,shield:level},infantry:a.infantry+extra,armored:a.armored+Math.floor(extra/2)};
  });
  if(world.turn%3===0&&world.armies.length<10&&!closingCampaign){
    const region=REGIONS.filter(r=>r!==world.focus).sort((a,b)=>world.pressure[b]-world.pressure[a])[0];
    const army=makeArmy(world,region,Math.min(cap,Math.max(1,tier-1)));
    world.serial++;world.armies.push(army);events.push(`${regionLabel(region)} bölgesinde ${army.name} ortaya çıktı.`);
  }
  if(world.turn>=12&&tier>=3&&held.size>=9&&world.cities.length<6&&!closingCampaign){
    const candidate=world.armies.find(a=>a.age>=9&&a.level>=3&&world.pressure[a.biome]>=9);
    if(candidate){world.armies=world.armies.filter(a=>a.id!==candidate.id);const fort=foundCity(candidate,world.serial);world.cities.push(fort);events.push(`${candidate.name}, ${fort.name} şehrini kurdu.`)}
  }
  const owned=[...baseCities,...world.cities].filter(e=>held.has(e.id)&&world.pressure[e.biome]>=12&&world.turn-(world.capturedAt[e.id]??world.turn)>=12);
  const reclaimed=[];
  if(world.turn>=24&&held.size>=8&&world.turn-world.lastReclaim>=12&&owned.length){
    const target=owned.sort((a,b)=>world.pressure[b.biome]-world.pressure[a.biome])[0];
    reclaimed.push(target.id);world.lastReclaim=world.turn;world.capturedAt[target.id]=world.turn;
    events.push(`${target.name}, ${regionLabel(target.biome)} birlikleri tarafından geri alındı.`);
  }
  if(world.pendingRaid?.kind==='city'&&reclaimed.includes(world.pendingRaid.targetCityId))world.pendingRaid=null;
  if(reclaimed.length)world.raidQueue=world.raidQueue.filter(raid=>!reclaimed.includes(raid.targetCityId));
  if(!world.pendingRaid&&world.turn-world.lastRaidTurn>=2){
    world.raidQueue.sort((a,b)=>a.dueTurn-b.dueTurn);
    while(world.raidQueue.length&&world.raidQueue[0].dueTurn<=world.turn){
      const raid=world.raidQueue.shift();
      if(raid.kind==='city'&&(!held.has(raid.targetCityId)||reclaimed.includes(raid.targetCityId)))continue;
      if(raid.kind==='home'&&Object.values(city.roster).reduce((a,b)=>a+b,0)<2){raid.dueTurn=world.turn+1;world.raidQueue.push(raid);break}
      world.pendingRaid=raid;world.lastRaidTurn=world.turn;
      events.push(raid.kind==='home'?'Mavi Karargâh baskın altında!':`${[...baseCities,...world.cities].find(e=>e.id===raid.targetCityId)?.name||'Ele geçirilen şehir'} baskın altında!`);
      break;
    }
  }
  return {world,events,reclaimed,raid:world.pendingRaid};
}

export function regionLabel(region){return {snow:'Kutup',forest:'Orman',desert:'Çöl'}[region]||region}
