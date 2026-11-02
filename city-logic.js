export const CITY_KEY = 'orman-savaslari-city-v1';
export const INITIAL_CITY = {
  gold: 300, food: 500, ore: 500, armor: 0, barracks: 1, forge: 1, granary: 1, testMode:false,
  roster: { archer: 30, infantry: 30, cavalry: 30 }, lastHarvest: 0, lastProduction: 0,
  armorStock: Array(10).fill(2), equipment: {archer:{stars:1,weapon:1,armor:0,arrows:1,shield:0},infantry:{stars:1,weapon:1,armor:0,arrows:1,shield:1},cavalry:{stars:1,weapon:1,armor:0,arrows:1,shield:0}}, lastTaxes:0,
};

export function makeCity(saved = {}) {
  const equipment=Object.fromEntries(['archer','infantry','cavalry'].map(type=>[type,{...INITIAL_CITY.equipment[type],...(saved.equipment?.[type]||{})}]));
  const roster={...INITIAL_CITY.roster,...(saved.roster||{})};
  const armorWorn=Object.fromEntries(['archer','infantry','cavalry'].map(type=>{
    const existing=saved.armorWorn?.[type];
    const legacyCount=saved.armoredCounts?.[type]??(equipment[type].armor>0?roster[type]:0);
    const levels=Array.isArray(existing)?existing:Array.from({length:legacyCount},()=>equipment[type].armor||1);
    return [type,levels.slice(0,roster[type]).map(level=>Math.max(1,Math.min(5,Number(level)||1)))];
  }));
  return {
    ...INITIAL_CITY, ...saved, testMode:false,
    roster,
    armorStock: Array.isArray(saved.armorStock)?[...saved.armorStock]:(Object.keys(saved).length?Array.from({length:saved.armor||0},()=>1):[...INITIAL_CITY.armorStock]),
    equipment,armorWorn,
    armoredCounts:Object.fromEntries(['archer','infantry','cavalry'].map(type=>[type,armorWorn[type].length])),
  };
}

export function foodCapacity(city) { return 650 + city.granary * 450; }
export function foodPerMinute(city) { return city.granary * 3; }
export function gearUpgradeCost(gear,op){
  if(op==='equip')return {stock:1};
  const key=op==='stars'?'stars':op==='arrows'?'arrows':op==='shield'?'shield':'weapon';
  return op==='stars'?{gold:Math.round((140+gear.stars*110)*.525),food:55+gear.stars*25}:{gold:Math.round((110+gear[key]*95)*.525),ore:25+gear[key]*18};
}
export function armorUpgradeCost(city,type){
  const levels=city.armorWorn[type]||[],eligible=levels.filter(level=>level<5);
  return {count:eligible.length,gold:Math.round(eligible.reduce((sum,level)=>sum+24+level*8,0)*.525),ore:eligible.reduce((sum,level)=>sum+9+level*3,0)};
}
export function cityActionCost(city,action){
  const costs={archer:{gold:160,food:55,count:10},infantry:{gold:220,food:75,count:10},cavalry:{gold:320,food:115,count:5},armor:{gold:260+Math.max(0,city.forge-1)*70,ore:50+Math.max(0,city.forge-1)*15,count:10},barracks:{gold:400+city.barracks*180,ore:65},granary:{gold:280+city.granary*100,ore:50},forge:{gold:360+city.forge*170,ore:70}};
  const cost=costs[action];return cost?{...cost,gold:Math.round(cost.gold*.525)}:null;
}
export function produceFood(city, now) {
  const next = makeCity(city);
  if (!next.lastProduction) { next.lastProduction = now; return next; }
  const minutes = Math.floor((now - next.lastProduction) / 60000);
  if (minutes > 0) {
    next.food = Math.min(foodCapacity(next), next.food + minutes * foodPerMinute(next));
    next.lastProduction += minutes * 60000;
  }
  return next;
}

export function cityAction(city, action, now = Date.now(), quantity = 1, equipOptions = {}) {
  const next = produceFood(city, now);
  const gearMatch=/^(equip|armor-upgrade|weapon|arrows|stars|shield)-(archer|infantry|cavalry)$/.exec(action);
  if(gearMatch){
    const [,op,type]=gearMatch,gear=next.equipment[type];
    if(op==='equip'){
      if(!Number.isInteger(quantity)||quantity<1)return {city:next,ok:false,message:'Giydirilecek zırh adedini seçin.'};
      const level=Number(equipOptions.level ?? Math.max(0,...next.armorStock));
      const replaceLevel=Number(equipOptions.replaceLevel ?? 0);
      if(!Number.isInteger(level)||level<1||level>5||!Number.isInteger(replaceLevel)||replaceLevel<0||replaceLevel>5)return {city:next,ok:false,message:'Geçerli bir zırh seviyesi seçin.'};
      const inStock=next.armorStock.filter(v=>v===level).length;
      if(inStock<quantity)return {city:next,ok:false,message:`Depoda seviye ${level} zırhtan ${quantity} adet yok. Mevcut: ${inStock}.`};
      if(replaceLevel){
        if(level<=replaceLevel)return {city:next,ok:false,message:'Eski zırhı yalnızca daha yüksek seviyeli zırhla değiştirebilirsiniz.'};
        const wornCount=next.armorWorn[type].filter(v=>v===replaceLevel).length;
        if(wornCount<quantity)return {city:next,ok:false,message:`Seviye ${replaceLevel} zırh giyen ${quantity} asker yok. Mevcut: ${wornCount}.`};
      }else if(next.armoredCounts[type]+quantity>next.roster[type])return {city:next,ok:false,message:`Bu birlik için en fazla ${next.roster[type]-next.armoredCounts[type]} askere daha zırh giydirilebilir.`};
      let removed=0;next.armorStock=next.armorStock.filter(v=>v!==level||removed++>=quantity);
      if(replaceLevel){let changed=0;next.armorWorn[type]=next.armorWorn[type].map(v=>v===replaceLevel&&changed++<quantity?level:v);next.armorStock.push(...Array(quantity).fill(replaceLevel))}
      else next.armorWorn[type].push(...Array(quantity).fill(level));
      next.armoredCounts[type]=next.armorWorn[type].length;
      gear.armor=Math.max(0,...next.armorWorn[type]);
      return {city:next,ok:true,message:`${type==='archer'?'Okçu':type==='infantry'?'Piyade':'Süvari'}: ${quantity} askere seviye ${level} zırh ${replaceLevel?`giydirildi; eski seviye ${replaceLevel} zırhlar depoya döndü`:'giydirildi'}. Zırhlı: ${next.armoredCounts[type]}/${next.roster[type]}.`};
    }
    if(op==='armor-upgrade'){
      const cost=armorUpgradeCost(next,type);
      if(!cost.count)return {city:next,ok:false,message:'Geliştirilecek zırh yok veya tüm zırhlar seviye 5.'};
      if(next.forge<Math.max(...next.armorWorn[type].filter(level=>level<5))+1)return {city:next,ok:false,message:'Zırhı geliştirmek için önce demirhaneyi yükseltin.'};
      if(!next.testMode&&(next.gold<cost.gold||next.ore<cost.ore))return {city:next,ok:false,message:`Gerekli kaynak: ${cost.gold} altın, ${cost.ore} maden.`};
      if(!next.testMode){next.gold-=cost.gold;next.ore-=cost.ore}
      next.armorWorn[type]=next.armorWorn[type].map(level=>Math.min(5,level+1));
      gear.armor=Math.max(...next.armorWorn[type]);
      return {city:next,ok:true,message:`${cost.count} ${type==='archer'?'okçu':type==='infantry'?'piyade':'süvari'} zırhı bir seviye geliştirildi.`};
    }
    if(op==='arrows'&&type!=='archer')return {city:next,ok:false,message:'Ok geliştirmesi yalnızca okçular içindir.'};
    if(op==='shield'&&type==='archer')return {city:next,ok:false,message:'Okçular kalkan kuşanamaz.'};
    const key=op==='stars'?'stars':op==='arrows'?'arrows':op==='shield'?'shield':'weapon';
    if(gear[key]>=5)return {city:next,ok:false,message:'En yüksek seviyeye ulaşıldı.'};
    const {gold=0,ore=0,food=0}=gearUpgradeCost(gear,op);
    if(!next.testMode&&(next.gold<gold||next.ore<ore||next.food<food))return {city:next,ok:false,message:`Gerekli kaynak: ${gold} altın${ore?`, ${ore} maden`:''}${food?`, ${food} yiyecek`:''}.`};
    if(!next.testMode){next.gold-=gold;next.ore-=ore;next.food-=food}gear[key]++;
    return {city:next,ok:true,message:`${type==='archer'?'Okçu':type==='infantry'?'Piyade':'Süvari'} ${key==='stars'?'yıldızı':key==='arrows'?'oku':key==='shield'?'kalkanı':'silahı'} seviye ${gear[key]} oldu.`};
  }
  if (action === 'harvest') {
    const remaining = Math.max(0, 3600000 - (now - next.lastHarvest));
    if (remaining) return { city: next, ok: false, message: `Hasada ${Math.ceil(remaining / 1000)} saniye kaldı.` };
    next.food = Math.min(foodCapacity(next), next.food + 95 + next.granary * 30);
    next.gold += 50;
    next.lastHarvest = now;
    return { city: next, ok: true, message: 'Hasat toplandı: yiyecek ve +50 altın. Sonraki hasat 1 saat sonra hazır.' };
  }
  const cost = cityActionCost(next,action);
  if (!cost) return { city: next, ok: false, message: 'Bilinmeyen şehir işlemi.' };
  if (['barracks', 'granary', 'forge'].includes(action) && next[action] >= 5) return { city: next, ok: false, message: 'Bu yapı en yüksek seviyede.' };
  if (!next.testMode&&(next.gold < cost.gold || next.food < (cost.food || 0) || next.ore < (cost.ore || 0))) return { city: next, ok: false, message: 'Yeterli altın, yiyecek veya maden yok.' };
  if(!next.testMode){next.gold -= cost.gold;next.food -= cost.food || 0;next.ore -= cost.ore || 0}
  if (['archer','infantry','cavalry'].includes(action)) next.roster[action] += cost.count + (next.barracks - 1) * 2;
  else if(action==='armor'){next.armor++;next.armorStock.push(...Array.from({length:10},()=>Math.min(5,next.forge)))}
  else next[action]++;
  return { city: next, ok: true, message: action==='armor'?`10 adet seviye ${next.forge} zırh üretildi.`:cost.count ? `${cost.count + (next.barracks - 1) * 2} ${action === 'archer' ? 'okçu' : action === 'infantry' ? 'piyade' : 'süvari'} eğitildi.` : `${action === 'granary' ? 'Ambar' : action === 'forge' ? 'Demirhane' : 'Kışla'} geliştirildi.` };
}

export function cityRevenue(site){
  const defenders=(site.archers||0)+(site.infantry||0)+(site.cavalry||0);
  return {gold:Math.round(35+(site.level||1)*20+defenders*.18+(site.towers||0)*5),food:Math.round(6+(site.level||1)*2+defenders*.04+(site.towers||0))};
}

export function reconcileBattleResult(city,deployed,survivors,survivingArmor){
  const next=makeCity(city);
  for(const type of ['archer','infantry','cavalry']){
    const sent=Math.max(0,deployed[type]||0),living=Math.max(0,survivors[type]||0);
    next.roster[type]=Math.max(0,next.roster[type]-Math.max(0,sent-living));
    const armorAtHome=(city.armorWorn?.[type]||[]).slice(sent);
    next.armorWorn[type]=[...armorAtHome,...(survivingArmor[type]||[])].slice(0,next.roster[type]);
    next.armoredCounts[type]=next.armorWorn[type].length;
    next.equipment[type].armor=Math.max(0,...next.armorWorn[type]);
  }
  return next;
}

export function collectCityRevenue(city,heldCities,now=Date.now()){
  const next=makeCity(city);
  if(!heldCities.length)return {city:next,ok:false,message:'Önce rakip bir şehri ele geçirin.'};
  const remaining=120000-(now-next.lastTaxes);
  if(remaining>0)return {city:next,ok:false,message:`Hasılata ${Math.ceil(remaining/1000)} saniye kaldı.`};
  const {gold,food}=heldCities.reduce((sum,e)=>{const yieldAmount=cityRevenue(e);sum.gold+=yieldAmount.gold;sum.food+=yieldAmount.food;return sum},{gold:0,food:0});
  next.gold+=gold;next.food=Math.min(foodCapacity(next),next.food+food);next.lastTaxes=now;
  return {city:next,ok:true,message:`${heldCities.length} şehirden ${gold} altın ve ${food} yiyecek toplandı.`};
}

export function battleReward(city, level, kind) {
  const next = makeCity(city);
  const gold = 150 + level * 80 + (kind === 'city' ? 100 : 0);
  const ore = 12 + level * 5 + (kind === 'city' ? 18 : 0);
  const food = 20 + level * 8;
  next.gold += gold;
  next.ore += ore;
  next.food = Math.min(foodCapacity(next), next.food + food);
  return { city: next, gold, ore, food:next.food-city.food };
}
