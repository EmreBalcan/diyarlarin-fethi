export const RESOURCE_RESPAWN_MS=30*60*1000;

export const RESOURCE_SITES=[
 ['Kuzey Demir Madeni','mine','snow',245,225,.34,90],['Buzul Ocağı','mine','snow',720,210,.43,115],['Akçam Avlağı','farm','snow',1280,220,.24,120],
 ['Çamlık Tarlası','farm','forest',255,380,.14,115],['Yeşil Vadi Çiftliği','farm','forest',555,365,.19,140],['Eski Taş Ocağı','mine','forest',835,385,.25,100],['Kereste Kampı','depot','forest',1110,370,.30,105],['Kervan Ambarı','depot','forest',1400,380,.39,125],
 ['Nehir Kıyısı Tarlası','farm','forest',260,535,.22,130],['Gümüş Damarı','mine','forest',640,525,.38,125],['Güney Odunluğu','depot','forest',1020,530,.27,105],['Kızıl Kum Ocağı','mine','desert',1380,520,.41,140],
 ['Sınır Çiftliği','farm','desert',370,665,.33,145],['Çöl Kervanı','depot','desert',830,675,.46,155],['Vaha Bahçesi','farm','desert',1250,680,.29,165],
 ['Kuzey Altın Damarı','gold','snow',1010,270,.48,125],['Eski Altın Kuyusu','gold','forest',425,465,.51,140],['Kayıp Hazine Yolu','gold','desert',1115,625,.57,155]
].map(([name,kind,terrain,x,y,risk,baseYield],i)=>({id:`resource-${i+1}`,name,kind,terrain,x,y,risk,baseYield,variant:i%3,sceneSeed:401+i*37}));
export const totalTroops=r=>r.archer+r.infantry+r.cavalry;
export function expeditionCost(site,roster){return Math.ceil(8+totalTroops(roster)*(site.terrain==='snow'?1.18:site.terrain==='desert'?1.1:.95)+roster.cavalry*.55)}
export function travelLosses(roster,random=Math.random){const losses={};for(const type of ['archer','infantry','cavalry']){let n=0;for(let i=0;i<roster[type];i++)if(random()<(type==='cavalry'?.018:.009))n++;losses[type]=n}return losses}
export function applyTravelLosses(city,dispatched,losses){
  const next={...city,roster:{...city.roster},armoredCounts:{...city.armoredCounts},armorWorn:Object.fromEntries(['archer','infantry','cavalry'].map(type=>[type,[...(city.armorWorn?.[type]||[])]]))};
  const survivors={};
  for(const type of ['archer','infantry','cavalry']){
    const sent=Math.max(0,Math.min(next.roster[type]||0,dispatched[type]||0));
    const lost=Math.max(0,Math.min(sent,losses[type]||0));
    survivors[type]=sent-lost;
    next.roster[type]-=lost;
    next.armorWorn[type]=next.armorWorn[type].slice(0,next.roster[type]);
    next.armoredCounts[type]=Math.min(next.armoredCounts[type]||0,next.roster[type],next.armorWorn[type].length||next.armoredCounts[type]||0);
  }
  return {city:next,survivors};
}
export function visibleWorkerCount(roster){return Math.min(48,Math.max(0,totalTroops(roster)))}
export function gatheringReward(site,roster){const amount=Math.round(site.baseYield*(.8+Math.min(1,totalTroops(roster)/65)*.7));return site.kind==='farm'?{food:Math.round(amount*.68),ore:0,gold:0}:site.kind==='mine'?{food:0,ore:Math.round(amount*.72),gold:0}:site.kind==='gold'?{food:0,ore:Math.round(amount*.14),gold:Math.round(amount*1.55)}:{food:0,ore:Math.round(amount*.22),gold:Math.round(amount*1.75)}}
export function ambushEncounter(site,playerTier=1){const level=Math.min(5,Math.max(1,Math.ceil(playerTier*.75)));const strength=site.kind==='gold'?1.3:1;return {id:`ambush-${site.id}`,name:`${site.name} Baskını`,kind:'ambush',terrain:site.terrain,biome:site.terrain,variant:site.variant,sceneSeed:site.sceneSeed,phase:site.sceneSeed,level,archers:Math.round((4+level*3)*strength),infantry:Math.round((9+level*6)*strength),cavalry:Math.round((1+level*2)*strength),towers:0,armored:Math.round(level*1.5*strength)}}
