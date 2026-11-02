import { enemyLevel } from './enemy-ai.js';

export const UNIT_LABELS = { archer: 'Okçu', infantry: 'Piyade', cavalry: 'Süvari' };
export const UNIT_ICON = { archer: '🏹', infantry: '🛡', cavalry: '♞' };
export const UNIT_HP = { archer: 52, infantry: 135, cavalry: 115 };
export const PLAYER_COUNTS = { archer: 30, infantry: 40, cavalry: 50 };
export const TERRAIN_LABELS = { forest: 'Orman yolu', mountain: 'Dağ geçidi', river: 'Nehir geçişi', desert: 'Çöl geçidi', snow: 'Karlı kuzey', city: 'Şehir kuşatması' };
export const TERRAIN_VARIANTS = { forest: 3, river: 3, desert: 3, snow: 4, mountain: 2, city: 1 };

const CITY_NAMES = ['Taşhisar','Kızılova','Demirkapı','Sungur Kalesi','Çamlıburç','Kuzey Hisarı','Akpınar','Bozkale','Gölgelişehir','Yelhisar','Kurtköy','Aktepe','Batı Kalesi'];
const ARMY_NAMES = ['Kızıl Öncü','Kuzey Devriyesi','Demir Mızrak','Karanlık Süvari','Bozkır Muhafızları','Kızıl Okçular','Geçit Nöbeti','Kuzey Akıncıları','Gölge Birliği','Sınır Devriyesi','Ateş Muhafızları','Demir Kalkan','Kurt Sürüsü','Vadi Ordusu','Doğu Akıncıları','Kızıl Sancak','Eski Yol Nöbeti','Dağ Muhafızları','Nehir Devriyesi','Sis Avcıları','Batı Süvarileri','Kaya Ordusu','Kuzey Okçuları','Güney Kolordusu','Dere Nöbeti','Demir Atlılar','Vadi Baskını','Sınır Akıncıları','Kara Sancak','Uzun Yol Ordusu','Bozkır Okçuları','Alacakaranlık Birliği','Nehir Atlıları','Duman Devriyesi','Kayalık Muhafızlar','Çamlık Ordusu','Kızıl Kılıç'];

export function generateEncounters(){
  let cityIndex=0,armyIndex=0;
  const terrainUses={},cityUses={snow:0,forest:0,desert:0};
  return Array.from({length:50},(_,i)=>{
    const col=i%10,row=Math.floor(i/10),kind=i%4===0?'city':'army';
    const biome=row===0?'snow':row>=3?'desert':'forest';
    const terrain=kind==='city'?'city':i===23?'mountain':row===0?'snow':row>=3?'desert':(['forest','river','mountain'][(i+row)%3]);
    const variant=i===23?1:(terrainUses[terrain]||0)%TERRAIN_VARIANTS[terrain];
    terrainUses[terrain]=(terrainUses[terrain]||0)+1;
    const cityVariant=kind==='city'?cityUses[biome]++:null;
    const x=155+col*137+((i*37)%41)-18;
    const y=150+row*148+((i*23)%29)-14;
    const starter=kind==='army'&&(i<12||[31,32,33,41,42,43].includes(i));
    const force=kind==='city'?205+(i*71)%201:starter?32+(i*17)%45:50+(i*97)%251;
    const mix=(i*13)%5;
    const archers=Math.round(force*(.19+mix*.045));
    const cavalry=Math.round(force*(.13+((i*7)%5)*.035));
    const infantry=force-archers-cavalry;
    const level=starter?1:enemyLevel(i,kind);
    const quality=starter?1:Math.min(5,Math.max(1,level+((i*17)%5===0?1:0)-((i*11)%7===0?1:0)));
    const gear={stars:level,weapon:quality,armor:Math.max(0,quality-((i*3)%3)),arrows:quality,shield:quality,weaponStyle:['kılıç','balta','mızrak'][i%3]};
    return {id:`hedef-${i+1}`,kind,terrain,biome,variant,cityVariant,sceneSeed:i+1,x,y,phase:i*1.7,name:kind==='city'?CITY_NAMES[cityIndex++]:ARMY_NAMES[armyIndex++],level,quality,gear,starter,archers,infantry,cavalry,armored:Math.round(infantry*.45+cavalry*.8),towers:kind==='city'?Math.min(8,1+level+((i*3)%3)):0};
  });
}

export function aliveCount(squad){return squad.units.reduce((n,u)=>n+(u.hp>0),0)}

export function splitUnitArray(units,counts){
  const living=units.filter(u=>u.hp>0);
  if(!Array.isArray(counts)||![2,3,5].includes(counts.length)||counts.some(n=>!Number.isInteger(n)||n<1)||counts.reduce((a,b)=>a+b,0)!==living.length)throw new Error('Bölme sayıları mevcut asker sayısına eşit olmalı.');
  let cursor=0;
  return counts.map(n=>{const group=living.slice(cursor,cursor+n);cursor+=n;return group});
}

export function balancedCounts(total,parts){
  if(![2,3,5].includes(parts)||total<parts)throw new Error('Yeterli asker yok.');
  return Array.from({length:parts},(_,i)=>Math.floor(total/parts)+(i<total%parts?1:0));
}

export function snapToGrid(x,y){
  const ox=80,oy=384;
  const u=((x-ox)/54+(y-oy)/27)/2;
  const v=((x-ox)/54-(y-oy)/27)/2;
  const a=Math.round(u),b=Math.round(v);
  return {x:Math.max(95,Math.min(1510,ox+54*(a+b))),y:Math.max(115,Math.min(775,oy+27*(a-b)))};
}

