import {CITY_KEY,makeCity} from './city-logic.js';
import {WORLD_KEY} from './world-logic.js';
const KEYS=[CITY_KEY,WORLD_KEY,'orman-savaslari-victories','orman-resource-cooldowns-v1','orman-campaign-complete-v1'];
export function exportSave(storage){
  return JSON.stringify({game:'diyarlarin-fethi',version:1,savedAt:new Date().toISOString(),data:Object.fromEntries(KEYS.map(key=>[key,storage.getItem(key)]))});
}
export function importSave(text,storage){
  if(typeof text!=='string'||text.length>1500000)throw new Error('Yedek kodu geçersiz veya çok büyük.');
  const file=JSON.parse(text);
  if(file.game!=='diyarlarin-fethi'||file.version!==1||!file.data)throw new Error('Bu kod Diyarların Fethi yedeği değil.');
  const data=file.data,city=JSON.parse(data[CITY_KEY]||'null'),world=JSON.parse(data[WORLD_KEY]||'{}'),victories=JSON.parse(data['orman-savaslari-victories']||'[]'),cooldowns=JSON.parse(data['orman-resource-cooldowns-v1']||'{}');
  const integer=n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000000;
  if(!city||!['gold','food','ore'].every(key=>integer(city[key]))||!['archer','infantry','cavalry'].every(type=>integer(city.roster?.[type])&&city.roster[type]<=100000))throw new Error('Yedekteki asker veya kaynak bilgileri geçersiz.');
  if(!Array.isArray(victories)||victories.some(id=>typeof id!=='string'))throw new Error('Yedekteki harita bilgisi geçersiz.');
  for(const key of ['armies','cities'])if(world[key]!==undefined&&(!Array.isArray(world[key])||world[key].some(e=>!e||typeof e.id!=='string'||typeof e.name!=='string'||!Number.isFinite(e.x)||!Number.isFinite(e.y)||!['archers','infantry','cavalry','level','towers'].every(k=>integer(e[k]||0)))))throw new Error('Yedekteki dünya bilgisi geçersiz.');
  if(!cooldowns||Array.isArray(cooldowns)||typeof cooldowns!=='object'||Object.values(cooldowns).some(n=>!Number.isFinite(n)||n<0))throw new Error('Yedekteki kaynak süreleri geçersiz.');
  const normalized=makeCity(city);
  const staged={...data,[CITY_KEY]:JSON.stringify(normalized)};
  // Parse and validate everything before changing any stored campaign data.
  for(const key of KEYS){const value=staged[key];if(value!==null&&value!==undefined&&typeof value!=='string')throw new Error('Yedek biçimi geçersiz.')}
  for(const key of KEYS){const value=staged[key];if(value===null||value===undefined)storage.removeItem(key);else storage.setItem(key,value)}
}
