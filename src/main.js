import '../style.css';
import {clampMapCamera} from './map-camera.js';
import forestUrl from '../assets/images/maps/forest/battlefield.webp';
import cityUrl from '../assets/images/maps/city/city-battlefield.webp';
import citySnowUrl from '../assets/images/maps/snow/city-snow.webp';
import citySnow2Url from '../assets/images/maps/snow/city-snow-2.webp';
import citySnow3Url from '../assets/images/maps/snow/city-snow-3.webp';
import cityDesertUrl from '../assets/images/maps/desert/city-desert.webp';
import cityDesert2Url from '../assets/images/maps/desert/city-desert-2.webp';
import cityDesert3Url from '../assets/images/maps/desert/city-desert-3.webp';
import cityDesert4Url from '../assets/images/maps/desert/city-desert-4.webp';
import cityDesert5Url from '../assets/images/maps/desert/city-desert-5.webp';
import cityForestUrl from '../assets/images/maps/forest/city-forest.webp';
import cityForest2Url from '../assets/images/maps/forest/city-forest-2.webp';
import cityForest3Url from '../assets/images/maps/forest/city-forest-3.webp';
import cityForest4Url from '../assets/images/maps/forest/city-forest-4.webp';
import mountainUrl from '../assets/images/maps/mountain/mountain-battlefield.webp';
import mountainDryUrl from '../assets/images/maps/mountain/mountain-dry.webp';
import riverUrl from '../assets/images/maps/river/river-battlefield.webp';
import forest2Url from '../assets/images/maps/forest/forest-2.webp';
import forest3Url from '../assets/images/maps/forest/forest-3.webp';
import river2Url from '../assets/images/maps/river/river-2.webp';
import riverFordUrl from '../assets/images/maps/river/river-ford.webp';
import desert1Url from '../assets/images/maps/desert/desert-1.webp';
import desert2Url from '../assets/images/maps/desert/desert-2.webp';
import desert3Url from '../assets/images/maps/desert/desert-3.webp';
import snow1Url from '../assets/images/maps/snow/snow-1.webp';
import snow2Url from '../assets/images/maps/snow/snow-2.webp';
import snow3Url from '../assets/images/maps/snow/snow-3.webp';
import snow4Url from '../assets/images/maps/snow/snow-4.webp';
import worldUrl from '../assets/images/maps/world/world-map-winter.webp';
import playerCityUrl from '../assets/images/maps/city/player-city.webp';
import blueArcherUrl from '../assets/images/units/blue-archer.webp';
import blueInfantryUrl from '../assets/images/units/blue-infantry.webp';
import blueCavalryUrl from '../assets/images/units/blue-cavalry.webp';
import gatherMineBgUrl from '../assets/images/gathering/gather-bg-mine.webp';
import gatherFarmBgUrl from '../assets/images/gathering/gather-bg-farm.webp';
import gatherDepotBgUrl from '../assets/images/gathering/gather-bg-depot.webp';
import gatherFarmWorkersUrl from '../assets/images/gathering/gather-workers-farm.webp';
import gatherMineWorkersUrl from '../assets/images/gathering/gather-workers-mine.webp';
import gatherDepotWorkersUrl from '../assets/images/gathering/gather-workers-depot.webp';
import gatherWagonUrl from '../assets/images/gathering/gather-wagon.webp';
import redArcherUrl from '../assets/images/units/red-front-archer.webp';
import redInfantryUrl from '../assets/images/units/red-front-infantry.webp';
import redCavalryUrl from '../assets/images/units/red-front-cavalry.webp';
import blueArcherRanksUrl from '../assets/images/sprites/blue-archer.webp';
import blueInfantryRanksUrl from '../assets/images/sprites/blue-infantry.webp';
import blueCavalryRanksUrl from '../assets/images/sprites/blue-cavalry.webp';
import redArcherRanksUrl from '../assets/images/sprites/red-archer.webp';
import redInfantryRanksUrl from '../assets/images/sprites/red-infantry.webp';
import redCavalryRanksUrl from '../assets/images/sprites/red-cavalry.webp';
import blueShieldRanksUrl from '../assets/images/sprites/shield-blue.webp';
import redShieldRanksUrl from '../assets/images/sprites/shield-red.webp';
import swordRanksUrl from '../assets/images/sprites/sword.webp';
import axeRanksUrl from '../assets/images/sprites/axe.webp';
import spearRanksUrl from '../assets/images/sprites/spear.webp';
import armorRanksUrl from '../assets/images/sprites/armor-v2.webp';
import bowRanksUrl from '../assets/images/sprites/bow.webp';
import arrowRanksUrl from '../assets/images/sprites/arrows.webp';
import {UNIT_LABELS,UNIT_ICON,UNIT_HP,TERRAIN_LABELS,generateEncounters,aliveCount,splitUnitArray,balancedCounts,snapToGrid} from './game-logic.js';
import {CITY_KEY,makeCity,produceFood,foodCapacity,foodPerMinute,gearUpgradeCost,armorUpgradeCost,cityActionCost,cityAction,battleReward,cityRevenue,collectCityRevenue,reconcileBattleResult} from './city-logic.js';
import {unitHealth,baseStrikeDamage,strikeDamage,armorHitCapacity,applyArmorHit} from './combat-math.js';
import {positionModifier} from './combat-position.js';
import {atlasCell} from './sprite-atlas.js';
import {makeEnemyMind,chooseTactic,TACTIC_LABELS} from './enemy-ai.js';
import {BattleAudio} from './audio.js';
import {battleReport,formatBattleDuration} from './battle-report.js';
import {exportSave,importSave} from './save-backup.js';
import {scheduleHarvestNotification} from './harvest-notification.js';
import {drawBattleEnvironment,drawCanopySway,drawHomeEnvironment,drawMapEnvironment,BattleEffects} from './environment.js';
import {makeBattleScene,nearestWalkable,advanceOnScene,surfaceAt} from './battle-scene.js';
import {RESOURCE_SITES,totalTroops,expeditionCost,travelLosses,applyTravelLosses,visibleWorkerCount,gatheringReward,ambushEncounter} from './expedition-logic.js';
import {WORLD_KEY,makeWorld,advanceWorld,recordConquest,playerWorldTier,regionLabel,isWorldConquered,makeRaidEncounter,autoDefendRaid,resolveRaid} from './world-logic.js';

const W=1600,H=900;
const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const imageCache=new Map();
const unitSpriteCache=new Map();
function image(url){if(!imageCache.has(url)){const im=new Image();im.decoding='async';im.fetchPriority=url===worldUrl?'high':'auto';im.src=url;imageCache.set(url,im)}return imageCache.get(url)}
const terrains={forest:[forestUrl,forest2Url,forest3Url],mountain:[mountainUrl,mountainDryUrl],river:[riverUrl,river2Url,riverFordUrl],desert:[desert1Url,desert2Url,desert3Url],snow:[snow1Url,snow2Url,snow3Url,snow4Url]};
const cityTerrains={snow:[citySnowUrl,citySnow2Url,citySnow3Url],forest:[cityForestUrl,cityUrl,cityForest2Url,cityForest3Url,cityForest4Url],desert:[cityDesertUrl,cityDesert2Url,cityDesert3Url,cityDesert4Url,cityDesert5Url]};
const terrainImage=e=>e.kind==='city'?cityTerrains[e.biome][e.cityVariant]:terrains[e.terrain][e.variant||0];
const spriteUrls={blue:{archer:blueArcherUrl,infantry:blueInfantryUrl,cavalry:blueCavalryUrl},red:{archer:redArcherUrl,infantry:redInfantryUrl,cavalry:redCavalryUrl}};
const rankAtlases={blue:{archer:blueArcherRanksUrl,infantry:blueInfantryRanksUrl,cavalry:blueCavalryRanksUrl},red:{archer:redArcherRanksUrl,infantry:redInfantryRanksUrl,cavalry:redCavalryRanksUrl}};
const gearAtlases={shield:{blue:blueShieldRanksUrl,red:redShieldRanksUrl},sword:swordRanksUrl,axe:axeRanksUrl,spear:spearRanksUrl,armor:armorRanksUrl,bow:bowRanksUrl,arrows:arrowRanksUrl};
const modularUrls=[...Object.values(rankAtlases.blue),...Object.values(rankAtlases.red),...Object.values(gearAtlases).flatMap(value=>typeof value==='string'?[value]:Object.values(value))];
const baseEncounters=generateEncounters();
const backgroundQueue=[...new Set(baseEncounters.filter(e=>e.starter).slice(0,3).map(terrainImage))];
let battleLoadId=0;
async function preloadBackgrounds(){
  for(const url of backgroundQueue){
    await new Promise(resolve=>('requestIdleCallback' in window?requestIdleCallback(resolve,{timeout:1800}):setTimeout(resolve,300)));
    if(view==='battle'||view==='gather'||document.hidden)continue;
    try{await image(url).decode()}catch{}
  }
}
const victories=new Set(JSON.parse(localStorage.getItem('orman-savaslari-victories')||'[]'));
let world=makeWorld(JSON.parse(localStorage.getItem(WORLD_KEY)||'{}'));
let encounters=[...baseEncounters,...world.armies,...world.cities];
const specs={archer:{speed:74,range:270,delay:.95,damage:27},infantry:{speed:90,range:48,delay:.78,damage:32},cavalry:{speed:122,range:58,delay:.86,damage:39}};
let view='map',mapFilter='all',selectedEncounter=null,selectedResource=null,activeEncounter=null,scene=null,phase='deploy',paused=false,speed=1,soundOn=true,selectedSquadId=null,squads=[],towers=[],arrows=[],sparks=[],mapTime=0,nextSquadId=1,lastFrame=0,scale=1,offX=0,offY=0,splitParts=2,uiAccumulator=0,mission=null,battleMission=null,battleRaid=null,campaignComplete=localStorage.getItem('orman-campaign-complete-v1')==='1';
const effects=new BattleEffects();
const previousCity=JSON.parse(localStorage.getItem(CITY_KEY)||'{}');
let city=makeCity(previousCity),enemyMind=null,enemyInitial=0,cityTick=0,worldClock=0;
const equipDraft=Object.fromEntries(['archer','infantry','cavalry'].map(type=>[type,{level:0,replaceLevel:0,quantity:1}]));
if(previousCity.testMode)localStorage.setItem(CITY_KEY,JSON.stringify(city));
if(!world.raidSerial&&victories.size){for(const target of encounters.filter(e=>e.kind==='city'&&victories.has(e.id))){const captured=world.capturedAt[target.id];world=recordConquest(world,target.id);if(captured!==undefined)world.capturedAt[target.id]=captured}localStorage.setItem(WORLD_KEY,JSON.stringify(world))}
const resourceCooldowns=JSON.parse(localStorage.getItem('orman-resource-cooldowns-v1')||'{}');
let battleRosterAtStart=null,battleSettled=true;
let battleElapsed=0,battleLoot={};
const audio=new BattleAudio();
audio.setBattleMusic('map');
document.addEventListener('pointerdown',()=>audio.unlock(),{once:true});
document.addEventListener('keydown',()=>audio.unlock(),{once:true});
if(window.Capacitor?.isNativePlatform?.())audio.unlock();
document.addEventListener('visibilitychange',()=>{audio.music.setEnabled(!document.hidden&&soundOn);if(document.hidden){if(view==='battle'&&phase==='battle')paused=true;audio.context?.suspend()}else{audio.context?.resume();if(view==='battle'&&paused)showModal('Duraklatıldı','Devam ederek savaşa dönebilirsiniz.')}});
const camera={zoom:1.06,x:0,y:0};
let pointer=null;

function resize(){const dpr=Math.min(devicePixelRatio||1,1.5,Math.sqrt(1600000/(innerWidth*innerHeight)));canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);scale=Math.max(canvas.width/W,canvas.height/H);offX=(canvas.width-W*scale)/2;offY=(canvas.height-H*scale)/2;clampCamera()}
addEventListener('resize',resize);resize();
function toWorld(clientX,clientY){return {x:(clientX*canvas.width/innerWidth-offX)/scale,y:(clientY*canvas.height/innerHeight-offY)/scale}}
function mapToWorld(p){return {x:(p.x-W/2-camera.x)/camera.zoom+W/2,y:(p.y-H/2-camera.y)/camera.zoom+H/2}}
function mapPosition(e){if(e.kind==='city')return {x:e.x,y:e.y};return {x:e.x+Math.sin(mapTime*.25+e.phase)*16,y:e.y+Math.cos(mapTime*.20+e.phase)*9}}
function clampCamera(){Object.assign(camera,clampMapCamera(camera,W,H,canvas.width/scale,canvas.height/scale))}
function setZoom(change){camera.zoom=Math.max(1,Math.min(2.4,camera.zoom+change));clampCamera()}

function render(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(offX,offY);ctx.scale(scale,scale);if(view==='map')renderMap();else if(view==='city'){drawCover(playerCityUrl);drawHomeEnvironment(ctx,mapTime)}else if(view==='gather')renderGather();else renderBattle();ctx.restore()}
function drawCover(url){const im=image(url);if(im.complete&&im.naturalWidth)ctx.drawImage(im,0,0,W,H);else{ctx.fillStyle='#26372c';ctx.fillRect(0,0,W,H);ctx.fillStyle='#e9d7a9';ctx.font='bold 25px Georgia';ctx.textAlign='center';ctx.fillText(im.complete?'Görsel yüklenemedi':'Harita yükleniyor…',W/2,H/2)}}
function renderMap(){
  ctx.save();ctx.translate(W/2+camera.x,H/2+camera.y);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-W/2,-H/2);
  drawCover(worldUrl);
  ctx.fillStyle='rgba(9,18,12,.10)';ctx.fillRect(0,0,W,H);
  drawMapEnvironment(ctx,mapTime);
  drawMapMarker(210,748,'⌂','#3979ad',false,'Mavi Karargâh');
  for(const e of encounters){if(e.kind==='army'&&victories.has(e.id))continue;if(mapFilter!=='all'&&e.kind!==mapFilter)continue;const p=mapPosition(e);const chosen=selectedEncounter?.id===e.id;const cityColor=e.biome==='snow'?'#607d92':e.biome==='desert'?'#b27d47':'#9f3f31';drawMapMarker(p.x,p.y,e.kind==='city'?'♜':'⚑',victories.has(e.id)?'#428b65':e.kind==='city'?cityColor:e.starter?'#c26a3b':'#9f3f31',chosen,e.name)}
  if(mapFilter==='all'||mapFilter==='resource')for(const site of RESOURCE_SITES)drawMapMarker(site.x,site.y,site.kind==='farm'?'✿':site.kind==='mine'?'⚒':site.kind==='gold'?'◈':'▣',resourceCooldowns[site.id]>Date.now()?'#6d6959':site.kind==='gold'?'#b99538':'#428b65',selectedResource?.id===site.id,site.name);
  ctx.restore();
}
function drawMapMarker(x,y,glyph,color,chosen,name){
  ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=8;ctx.fillStyle='#101811a8';ctx.beginPath();ctx.ellipse(x,y+18,25,8,0,0,Math.PI*2);ctx.fill();
  if(chosen){ctx.strokeStyle='#f3df9a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y-7,27+Math.sin(mapTime*3)*3,0,Math.PI*2);ctx.stroke()}
  ctx.fillStyle=color;ctx.strokeStyle='#dbc897';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y-7,20,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#f6e8cf';ctx.font='bold 23px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(glyph,x,y-8);ctx.shadowBlur=0;
  if(chosen||glyph==='♜'||glyph==='⌂'){ctx.font=chosen?'bold 17px Georgia':'bold 12px Georgia';ctx.fillStyle='#f5e8ce';ctx.strokeStyle='#152016';ctx.lineWidth=4;ctx.strokeText(name,x,y+38);ctx.fillText(name,x,y+38)}ctx.restore()
}

function saveCity(){localStorage.setItem(CITY_KEY,JSON.stringify(city))}
function refreshWorld(){encounters=[...baseEncounters,...world.armies,...world.cities];$('worldStatus').textContent=`Sefer günü ${world.turn+1} · Yeni ordular ${world.armies.length} · Yeni şehirler ${world.cities.length}`;if(selectedEncounter&&!encounters.some(e=>e.id===selectedEncounter.id)){selectedEncounter=null;$('intelPanel').classList.add('hidden')}showRaidAlert()}
function persistWorld(){localStorage.setItem(WORLD_KEY,JSON.stringify(world));localStorage.setItem('orman-savaslari-victories',JSON.stringify([...victories]))}
function raidTarget(raid){return raid?.kind==='home'?{id:'home',name:'Mavi Karargâh',biome:'forest',terrain:'forest',level:1}:encounters.find(e=>e.id===raid?.targetCityId)}
function showRaidAlert(){const raid=world.pendingRaid,visible=Boolean(raid)&&!campaignComplete&&(view==='map'||view==='city');$('raidAlert').classList.toggle('hidden',!visible);if(!visible)return;const target=raidTarget(raid),enemy=makeRaidEncounter(raid,target||{name:'Şehir',biome:'forest',level:1},city,victories.size);$('raidTitle').textContent=raid.kind==='home'?'⚠ Karargâha baskın!':`⚠ ${target?.name||'Şehir'} baskın altında!`;$('raidDetails').textContent=raid.kind==='home'?`${enemy.archers+enemy.infantry+enemy.cavalry} kişilik zayıf akıncı grubu zarar vermek istiyor; karargâh ele geçirilemez.`:`${enemy.archers+enemy.infantry+enemy.cavalry} kişilik birlik saldırıyor. Savunma başarısız olursa şehir ve hasılatı kaybedilir.`}
function finishRaid(defended,manual=false){const raid=battleRaid||world.pendingRaid;if(!raid)return '';const target=raidTarget(raid),result=resolveRaid(world,raid,defended);world=result.world;for(const id of result.reclaimed)victories.delete(id);let damage='';if(raid.kind==='home'){const goldLoss=Math.min(city.gold,Math.max(8,Math.round(city.gold*(defended?.025:.07)))),foodLoss=Math.min(city.food,Math.max(12,Math.round(city.food*(defended?.035:.09))));if(!city.testMode){city.gold-=goldLoss;city.food-=foodLoss}damage=city.testMode?' Test modunda kaynak kaybı uygulanmadı.':` ${goldLoss} altın ve ${foodLoss} yiyecek kaybedildi.`;saveCity()}else if(defended&&!manual){const loss=Math.min(city.food,Math.round(city.food*.025));if(!city.testMode)city.food-=loss;damage=city.testMode?'':' Savunma için '+loss+' yiyecek harcandı.';saveCity()}battleRaid=null;persistWorld();refreshWorld();renderCity();const message=raid.kind==='home'?`Karargâh korundu.${damage}`:defended?`${target?.name||'Şehir'} savunuldu.${damage}`:`${target?.name||'Şehir'} geri alındı. Bu şehirden artık hasılat toplanamaz.`;$('worldEvent').textContent=message;$('worldEvent').classList.remove('hidden');setTimeout(()=>$('worldEvent').classList.add('hidden'),12000);if(!world.pendingRaid&&isWorldConquered(encounters,victories))completeCampaign();return message}
function completeCampaign(force=false){campaignComplete=true;localStorage.setItem('orman-campaign-complete-v1','1');if(!force&&view==='battle'&&phase==='ended')return;$('gameModal').classList.add('hidden');$('campaignVictoryStats').textContent=`${baseEncounters.length} başlangıç hedefi · ${world.cities.length} yeni şehir · ${world.turn+1}. sefer günü`;$('campaignVictory').classList.remove('hidden');$('raidAlert').classList.add('hidden')}
function advanceWorldTurn(focus){if(campaignComplete)return;const result=advanceWorld(world,{focus,city,victories,baseCities:baseEncounters.filter(e=>e.kind==='city'),baseArmies:baseEncounters.filter(e=>e.kind==='army')});world=result.world;for(const id of result.reclaimed)victories.delete(id);persistWorld();refreshWorld();if(result.events.length){$('worldEvent').textContent=result.events.join(' ');$('worldEvent').classList.remove('hidden');setTimeout(()=>$('worldEvent').classList.add('hidden'),12000)}}
function gearThumb(url,level,label){if(!level)return '';const n=Math.max(1,Math.min(5,Number(level)||1))-1;return `<span class="gear-thumb" role="img" aria-label="${label} seviye ${n+1}" title="${label} seviye ${n+1}" style="background-image:url('${url}');background-position:${(n%3)*50}% ${Math.floor(n/3)*100}%"></span>`}
function costText(cost){return [cost.stock?'Depodan 1 zırh':null,cost.gold?`${cost.gold} altın`:null,cost.ore?`${cost.ore} maden`:null,cost.food?`${cost.food} yiyecek`:null].filter(Boolean).join(' · ')}
function gearActionButton(type,op,label,gear){const level=op==='stars'?gear.stars:op==='arrows'?gear.arrows:op==='shield'?gear.shield:gear.weapon;const armorCost=op==='armor-upgrade'?armorUpgradeCost(city,type):null;const cost=op==='equip'?{stock:1}:armorCost||gearUpgradeCost(gear,op);const finished=op==='armor-upgrade'?!armorCost.count:op!=='equip'&&level>=5;return `<button data-city-action="${op}-${type}" aria-disabled="${finished}"><strong>${label}</strong><small>${finished?'En yüksek seviye / zırh yok':op==='armor-upgrade'?`${armorCost.count} zırh · ${costText(cost)}`:costText(cost)}</small></button>`}
function renderGearRow(type){const g=city.equipment[type],label=UNIT_LABELS[type],icon=UNIT_ICON[type],rank=rankAtlases.blue[type],weapon=type==='archer'?gearAtlases.bow:gearAtlases.sword,free=Math.max(0,city.roster[type]-(city.armoredCounts[type]||0)),draft=equipDraft[type],stockLevels=[...new Set(city.armorStock)].sort((a,b)=>b-a);if(!stockLevels.includes(draft.level))draft.level=stockLevels[0]||0;const worn=city.armorWorn[type]||[],replaceLevels=[...new Set(worn)].filter(level=>level<draft.level).sort((a,b)=>a-b);if(draft.replaceLevel&&!replaceLevels.includes(draft.replaceLevel))draft.replaceLevel=0;const wornSummary=[...new Set(worn)].sort((a,b)=>a-b).map(level=>`Sv.${level} ×${worn.filter(v=>v===level).length}`).join(' · ');return `<div class="gear-row"><strong>${icon} ${label}</strong><small>Asker seviyesi: ★${g.stars} · ${type==='archer'?'Yay':'Silah'} seviyesi: ${g.weapon} · Zırh seviyesi: ${g.armor}${type==='archer'?' · Ok seviyesi: '+g.arrows:' · Kalkan seviyesi: '+g.shield}</small><p class="armored-count">Zırhlı asker: ${worn.length} / ${city.roster[type]} · Zırhsız: ${free}${wornSummary?' · '+wornSummary:''}</p><div class="gear-icons">${gearThumb(rank,g.stars,'Asker')}${gearThumb(weapon,g.weapon,type==='archer'?'Yay':'Kılıç')}${gearThumb(gearAtlases.armor,g.armor,'Zırh')}${type==='archer'?gearThumb(gearAtlases.arrows,g.arrows,'Ok'):gearThumb(gearAtlases.shield.blue,g.shield,'Kalkan')}</div><div class="equip-controls"><label>Zırh <button type="button" class="equip-choice" data-equip-picker="level" data-equip-type="${type}">${draft.level?`Sv.${draft.level} · ${city.armorStock.filter(v=>v===draft.level).length} adet`:'Depoda yok'} ▾</button></label><label>Asker <button type="button" class="equip-choice" data-equip-picker="replaceLevel" data-equip-type="${type}">${draft.replaceLevel?`Sv.${draft.replaceLevel} zırhı değiştir`:'Zırhsız'} ▾</button></label><label>Adet <input id="equipQty-${type}" data-equip-qty="${type}" type="number" inputmode="numeric" min="1" value="${draft.quantity}"></label><button data-city-action="equip-${type}">Giydir / Değiştir</button></div><div class="gear-upgrades">${gearActionButton(type,'armor-upgrade','Zırh Geliştir',g)}${gearActionButton(type,'weapon',type==='archer'?'Yayı Geliştir':'Silahı Geliştir',g)}${gearActionButton(type,'stars','Askeri Eğit',g)}${type==='archer'?gearActionButton(type,'arrows','Oku Geliştir',g):gearActionButton(type,'shield','Kalkanı Geliştir',g)}</div></div>`}
function renderCity(){
  city=produceFood(city,Date.now());saveCity();
  $('cityGold').textContent=city.testMode?'∞':city.gold;$('cityFood').textContent=city.testMode?'∞':city.food;$('cityOre').textContent=city.testMode?'∞':city.ore;
  $('panelGold').textContent=city.testMode?'∞':city.gold;$('panelFood').textContent=city.testMode?'∞':city.food;$('panelOre').textContent=city.testMode?'∞':city.ore;
  $('cityArchers').textContent=city.roster.archer;$('cityInfantry').textContent=city.roster.infantry;$('cityCavalry').textContent=city.roster.cavalry;$('cityArmor').textContent=city.armorStock.length;
  $('mapArmyPower').textContent=`${city.roster.archer} Okçu · ${city.roster.infantry} Piyade · ${city.roster.cavalry} Süvari`;
  $('cityStorage').textContent=city.testMode?'∞ / ∞':`${city.food} / ${foodCapacity(city)}`;$('cityProduction').textContent=foodPerMinute(city);
  $('barracksLevel').textContent=city.barracks;$('forgeLevel').textContent=city.forge;$('granaryLevel').textContent=city.granary;
  for(const action of ['archer','infantry','cavalry','armor','barracks','forge','granary']){const cost=cityActionCost(city,action),target=$(action+'Cost'),output=action==='armor'?'+10 zırh':cost.count?`+${cost.count+(city.barracks-1)*2} asker`:'';target.textContent=`${output} · ${costText(cost)}`.replace(/^ · /,'')}
  const remaining=Math.max(0,3600000-(Date.now()-city.lastHarvest));
  $('harvestInfo').textContent=remaining?`${Math.floor(remaining/60000)} dk ${Math.ceil((remaining%60000)/1000)} sn sonra hazır`:`+${95+city.granary*30} yiyecek · +50 altın · şimdi hazır`;
  $('armorStock').textContent=city.armorStock.length?Array.from({length:5},(_,i)=>({level:i+1,count:city.armorStock.filter(v=>v===i+1).length})).filter(q=>q.count).map(q=>`Sv.${q.level} ×${q.count}`).join(' · '):'Yok';
  if(!$('gearRows').contains(document.activeElement)||!document.activeElement.matches('input,select'))$('gearRows').innerHTML=['archer','infantry','cavalry'].map(renderGearRow).join('');
  const held=encounters.filter(e=>e.kind==='city'&&victories.has(e.id));const taxesLeft=Math.max(0,120000-(Date.now()-city.lastTaxes));$('taxInfo').textContent=`Ele geçirilen şehir: ${held.length}${taxesLeft?' · Yeni hasılat: '+Math.ceil(taxesLeft/1000)+' sn':''}`;
}
function infoSprite(url,level=1){const n=Math.max(0,Math.min(4,level-1));return `<div class="city-info-sprite" style="background-image:url('${url}');background-position:${n%3*50}% ${Math.floor(n/3)*100}%"></div>`}
function armorProtection(level){return Math.round((1-1/(1+.24*level))*100)}
function cityInfoDetails(action){
  const parts=action.split('-'),op=parts.length===3?parts[0]+'-'+parts[1]:parts[0],type=parts.at(-1),g=city.equipment[type],level=g?.[op],next=Math.min(5,(level||0)+1);
  if(['archer','infantry','cavalry'].includes(action)){
    const gear=city.equipment[action],cost=cityActionCost(city,action),count=cost.count+(city.barracks-1)*2;
    const health=unitHealth(action,gear),damage=Math.round(baseStrikeDamage(action,gear));
    const role={archer:'Uzaktan ok atar; yakın dövüşte kırılgandır.',infantry:'Ön safta dayanır ve okçuları korur.',cavalry:'Hızlı hücum eder; zırhsız okçulara ağır hasar verir.'}[action];
    return {title:`${UNIT_LABELS[action]} Eğit`,body:role,art:infoSprite(rankAtlases.blue[action],gear.stars),stats:[['Can',health],['Temel hasar / vuruş',damage],['Şimdi eğitilecek',`${count} asker`]],cost:costText(cost)};
  }
  if(action==='armor'){
    const tier=Math.min(5,city.forge),cost=cityActionCost(city,'armor');
    return {title:'Zırh Üret',body:'Bir üretimde depoya 10 zırh koyar. Adet seçerek okçu, piyade ve süvarilere dağıtabilirsin.',art:infoSprite(gearAtlases.armor,tier),stats:[['Üretilecek',`10 adet · seviye ${tier}`],['Hasar azaltma',`%${armorProtection(tier)}`],['Kırılma dayanımı',`${armorHitCapacity(tier)} darbe`],['Depodaki',city.armorStock.length]],cost:costText(cost)};
  }
  if(action==='harvest')return {title:'Hasat Topla',body:'Her hasatta ambara yiyecek, kasaya 50 altın eklenir. Yeni hasat saatte bir hazır olur. Hazır olduğunda bildirim gelir; alınmadığı sürece iki saatte bir hatırlatılır.',art:'🌾',stats:[['Yiyecek',`+${95+city.granary*30}`],['Altın','+50'],['Bekleme','1 saat'],['Hatırlatma','Hazırsa 2 saatte bir'],['Ambar kapasitesi',foodCapacity(city)]],cost:'Ücretsiz'};
  if(action==='barracks')return {title:'Kışla Geliştir',body:'Her asker eğitimi işleminde yetişen asker sayısını artırır.',art:'⚔',stats:[['Şimdiki ek asker',`+${(city.barracks-1)*2}`],['Sonraki ek asker',city.barracks<5?`+${city.barracks*2}`:'En yüksek seviye']],cost:costText(cityActionCost(city,'barracks'))};
  if(action==='forge')return {title:'Demirhane Geliştir',body:'Yeni üretilen zırhların seviyesini ve mevcut zırhların geliştirilebileceği üst sınırı belirler.',art:'⚒',stats:[['Şimdiki zırh seviyesi',city.forge],['Sonraki seviye',city.forge<5?city.forge+1:'En yüksek seviye'],['Zırh üretimi','Her seferinde 10 adet']],cost:costText(cityActionCost(city,'forge'))};
  if(action==='granary')return {title:'Ambar Geliştir',body:'Yiyecek kapasitesini ve dakika başına otomatik yiyecek üretimini artırır.',art:'🌾',stats:[['Şimdiki kapasite',foodCapacity(city)],['Sonraki kapasite',city.granary<5?foodCapacity({...city,granary:city.granary+1}):'En yüksek seviye'],['Üretim',`${foodPerMinute(city)} → ${city.granary<5?foodPerMinute({...city,granary:city.granary+1}):foodPerMinute(city)} / dk`]],cost:costText(cityActionCost(city,'granary'))};
  if(action==='taxes'){const held=encounters.filter(e=>e.kind==='city'&&victories.has(e.id));return {title:'Şehir Hasılatı',body:'Büyük ve güçlü şehirler daha fazla altın ve yiyecek üretir. Şehir kaybedilirse gelir de kesilir.',art:'♜',stats:[['Ele geçirilen şehir',held.length],['Beklenen altın',held.reduce((sum,e)=>sum+cityRevenue(e).gold,0)],['Beklenen yiyecek',held.reduce((sum,e)=>sum+cityRevenue(e).food,0)]],cost:'Ücretsiz · 120 saniyede bir'}}
  if(!g)return null;
  const worn=city.armorWorn[type]||[];
  if(op==='equip'){
    const draft=equipDraft[type],tier=draft.level||1,quantity=draft.quantity;
    return {title:`${UNIT_LABELS[type]} · Zırh Giydir`,body:'Depodan zırh seviyesi ve asker adedi seç. Daha yüksek seviyeli zırhla değiştirdiğinde eski zırh depoya döner.',art:infoSprite(gearAtlases.armor,tier),stats:[['Seçilen adet',quantity],['Hedef',draft.replaceLevel?`Sv.${draft.replaceLevel} zırhlı asker`:'Zırhsız asker'],['Depodaki seviye '+tier,city.armorStock.filter(v=>v===tier).length],['Seviye '+tier+' koruma',`%${armorProtection(tier)} · ${armorHitCapacity(tier)} darbe`]],cost:`${quantity} adet seviye ${tier} zırh`};
  }
  if(action.startsWith('armor-upgrade-')){
    const current=Math.max(0,...worn),cost=armorUpgradeCost(city,type);
    return {title:`${UNIT_LABELS[type]} · Zırh Geliştir`,body:'Bu sınıftaki kuşanılmış ve seviye 5 altında olan tüm zırhları bir seviye yükseltir. Demirhane yeni seviyeye uygun olmalıdır.',art:infoSprite(gearAtlases.armor,Math.max(1,current)),stats:[['Geliştirilecek',`${cost.count} zırh`],['Şimdiki koruma',current?`%${armorProtection(current)} · ${armorHitCapacity(current)} darbe`:'Zırh yok'],['Sonraki koruma',current&&current<5?`%${armorProtection(current+1)} · ${armorHitCapacity(current+1)} darbe`:'En yüksek seviye'],['Demirhane',`Seviye ${city.forge}`]],cost:costText(cost)};
  }
  const labels={weapon:type==='archer'?'Yay':'Silah',stars:'Asker',arrows:'Ok',shield:'Kalkan'},key=op,now=g[key]||0;
  const art=key==='stars'?rankAtlases.blue[type]:key==='weapon'?(type==='archer'?gearAtlases.bow:gearAtlases.sword):key==='arrows'?gearAtlases.arrows:gearAtlases.shield.blue;
  const effect=key==='stars'?['Can',`${unitHealth(type,g)} → ${now<5?unitHealth(type,{...g,stars:next}):unitHealth(type,g)}`]:key==='weapon'?['Silah hasar çarpanı',`${(1+.16*(now-1)).toFixed(2)}× → ${(1+.16*(next-1)).toFixed(2)}×`]:key==='arrows'?['Ok hasar çarpanı',`${(1+.10*(now-1)).toFixed(2)}× → ${(1+.10*(next-1)).toFixed(2)}×`]:['Kalkan hasar azaltma',`%${Math.round((1-1/(1+.08*now))*100)} → %${Math.round((1-1/(1+.08*next))*100)}`];
  return {title:`${UNIT_LABELS[type]} · ${labels[key]} Geliştir`,body:key==='stars'?'Asker eğitim seviyesi canı ve verdiği hasarı artırır.':key==='weapon'?'Yay veya yakın dövüş silahı her seviyede daha fazla hasar verir.':key==='arrows'?'Ok seviyesi okçuların verdiği hasarı artırır.':'Kalkan gelen hasarı azaltır.',art:infoSprite(art,Math.max(1,now)),stats:[['Şimdiki seviye',now],['Sonraki seviye',now<5?next:'En yüksek seviye'],effect],cost:costText(gearUpgradeCost(g,key))};
}
function showCityInfo(action){const details=cityInfoDetails(action);if(!details)return;$('cityInfoTitle').textContent=details.title;$('cityInfoBody').textContent=details.body;$('cityInfoArt').innerHTML=typeof details.art==='string'&&details.art.startsWith('<')?details.art:`<span>${details.art}</span>`;$('cityInfoStats').innerHTML=details.stats.map(([label,value])=>`<div><span>${label}</span><b>${value}</b></div>`).join('');$('cityInfoCost').textContent=`Gerekli kaynak: ${details.cost}`;$('cityInfo').classList.remove('hidden')}
function toggleCityPanel(open){
  const expanded=Boolean(open),hud=$('cityHud');
  hud.dataset.panel=expanded?'open':'closed';
  $('cityPanelToggle').setAttribute('aria-expanded',String(expanded));
  $('cityPanelToggle').textContent=expanded?'Menüyü Kapat':'Şehri Yönet';
  $('cityPanel').setAttribute('aria-hidden',String(!expanded));
  audio.cityCue('panel');
}
function openCity(){setView('city');renderCity();audio.unlock();audio.setTerrain('home',true);toggleCityPanel(false)}

function selectEncounter(e){selectedEncounter=e;const captured=victories.has(e.id);if(!captured)image(terrainImage(e));$('intelPanel').classList.remove('hidden');$('intelType').textContent=captured?(e.kind==='city'?'Ele Geçirilen Şehir':'Yenilmiş Ordu'):e.kind==='city'?'Rakip Şehir':'Yolda İlerleyen Ordu';$('intelName').textContent=e.name;$('intelTerrain').textContent=e.kind==='city'?`${{snow:'Karlı kale',desert:'Kumlu şehir',forest:'Orman şehri'}[e.biome]} · ${e.towers} kule`:TERRAIN_LABELS[e.terrain];$('intelLevel').textContent=e.level;$('intelArcher').textContent=captured?0:e.archers;$('intelInfantry').textContent=captured?0:e.infantry;$('intelCavalry').textContent=captured?0:e.cavalry;$('intelArmored').textContent=captured?0:e.armored;$('intelTowers').textContent=captured?0:e.towers;$('intelTowerRow').classList.toggle('hidden',captured||!e.towers);$('intelTotal').textContent=captured?0:e.archers+e.infantry+e.cavalry;$('enterBattleBtn').classList.toggle('hidden',captured);$('intelNote').textContent=captured?(e.kind==='city'?`Bu şehir senin kontrolünde. Hasılatı: ${cityRevenue(e).gold} altın ve ${cityRevenue(e).food} yiyecek / toplama.`:'Bu ordu yenildi ve haritadan kaldırıldı.'):`★${e.gear?.stars||e.level} asker · ${e.gear?.weaponStyle||'kılıç'} ${e.gear?.weapon||e.level} · Zırh ${e.gear?.armor||0} · Ok ${e.gear?.arrows||e.level}. Birliklerini dikkatle yerleştir.`}
function findEncounter(p){let match=null,near=29/camera.zoom;for(const e of encounters){if(e.kind==='army'&&victories.has(e.id))continue;if(mapFilter!=='all'&&e.kind!==mapFilter)continue;const q=mapPosition(e),d=Math.hypot(p.x-q.x,p.y-q.y);if(d<near){near=d;match=e}}return match}
function findResource(p){if(mapFilter!=='all'&&mapFilter!=='resource')return null;let hit=null,near=29/camera.zoom;for(const site of RESOURCE_SITES){const d=Math.hypot(p.x-site.x,p.y-site.y);if(d<near){near=d;hit=site}}return hit}
function selectedExpeditionRoster(){return {archer:Number($('sendArcher').value)||0,infantry:Number($('sendInfantry').value)||0,cavalry:Number($('sendCavalry').value)||0}}
function selectResource(site){selectedResource=site;selectedEncounter=null;$('intelPanel').classList.add('hidden');$('resourcePanel').classList.remove('hidden');$('resourceName').textContent=site.name;$('resourceDetails').textContent=`${{farm:'Tarla',mine:'Maden',depot:'Malzeme kampı',gold:'Altın sahası'}[site.kind]} · Baskın riski %${Math.round(site.risk*100)} · Bu risk asker sayısından bağımsızdır.`;for(const [type,id] of [['archer','sendArcher'],['infantry','sendInfantry'],['cavalry','sendCavalry']]){$(id).max=city.roster[type];$(id).value=type==='infantry'?Math.min(12,city.roster[type]):0}updateExpeditionEstimate()}
function updateExpeditionEstimate(){if(!selectedResource)return;const roster=selectedExpeditionRoster(),valid=Object.keys(roster).every(type=>Number.isInteger(roster[type])&&roster[type]>=0&&roster[type]<=city.roster[type]),cost=expeditionCost(selectedResource,roster),cooldown=Math.max(0,(resourceCooldowns[selectedResource.id]||0)-Date.now()),yielding=gatheringReward(selectedResource,roster);$('expeditionEstimate').textContent=`${totalTroops(roster)} asker · ${city.testMode?'test modunda ücretsiz':cost+' yiyecek yol masrafı'} · Olası kaynak: ${yielding.food?'🌾 '+yielding.food+' ':''}${yielding.ore?'⚒ '+yielding.ore+' ':''}${yielding.gold?'🪙 '+yielding.gold:''}${cooldown?' · Yeniden hazır: '+Math.ceil(cooldown/1000)+' sn':''}`;$('sendExpedition').disabled=!valid||totalTroops(roster)<1||(!city.testMode&&city.food<cost)||cooldown>0}
function finishMission(reward=false){if(!mission)return null;const {site,losses,roster}=mission;const earned={food:0,ore:0,gold:0};if(reward){const grant=mission.reward,beforeFood=city.food;city.food=Math.min(foodCapacity(city),city.food+grant.food);city.ore+=grant.ore;city.gold+=grant.gold;earned.food=city.food-beforeFood;earned.ore=grant.ore;earned.gold=grant.gold;saveCity()}resourceCooldowns[site.id]=Date.now()+90000;localStorage.setItem('orman-resource-cooldowns-v1',JSON.stringify(resourceCooldowns));mission=null;battleMission=null;if(reward)advanceWorldTurn(site.terrain);return {site,losses,roster,earned}}
async function sendExpedition(){
  updateExpeditionEstimate();if($('sendExpedition').disabled)return;
  const roster=selectedExpeditionRoster(),site=selectedResource,cost=expeditionCost(site,roster),losses=travelLosses(roster);
  const departure=applyTravelLosses(city,roster,losses),survivors=departure.survivors;
  city=departure.city;if(!city.testMode)city.food-=cost;saveCity();renderCity();
  mission={site,roster:survivors,dispatched:roster,losses,reward:gatheringReward(site,survivors),ambushed:Math.random()<site.risk,progress:0,state:'collecting'};
  const bg=image({farm:gatherFarmBgUrl,mine:gatherMineBgUrl,depot:gatherDepotBgUrl,gold:gatherMineBgUrl}[site.kind]);try{await bg.decode()}catch{}
  $('gatherTitle').textContent=site.name;
  $('gatherTroops').textContent=`${totalTroops(survivors)} asker görevde`;
  $('gatherStatus').textContent='Kaynaklar toplanıyor...';$('gatherProgress').style.width='0%';
  $('gatherYield').textContent=`Gönderilen: ${totalTroops(roster)} · Yolda kayıp: ${totalTroops(losses)} · Görevde kalan: ${totalTroops(survivors)} · Yol masrafı: ${cost} yiyecek`;
  $('ambushPanel').classList.add('hidden');setView('gather');
}
function drawGatherWorker(im,index,x,y,kind){
  const cw=im.naturalWidth/2,ch=im.naturalHeight/2,frame=index%4,phase=mapTime*(kind==='mine'?3.8:2.8)+index*1.37;
  const lift=Math.sin(phase)*2.8,lean=Math.sin(phase)*.055;
  ctx.fillStyle='rgba(18,21,14,.25)';ctx.beginPath();ctx.ellipse(x,y+2,20,6,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.translate(x,y);ctx.rotate(lean);ctx.drawImage(im,(frame%2)*cw,Math.floor(frame/2)*ch,cw,ch,-40,-86+lift,80,86);ctx.restore();
  if(index%3===0){ctx.fillStyle=kind==='mine'?'#d8c48e99':kind==='farm'?'#e5c67e77':'#b1a58a88';for(let j=0;j<2;j++){const px=x+Math.sin(phase+j*2)*13,py=y-20-j*13-(mapTime*13+j*7)%18;ctx.fillRect(px,py,2.5,2.5)}}
}
function renderGather(){
  if(!mission)return;const site=mission.site;
  drawCover({farm:gatherFarmBgUrl,mine:gatherMineBgUrl,depot:gatherDepotBgUrl,gold:gatherMineBgUrl}[site.kind]);
  ctx.fillStyle='rgba(13,24,16,.06)';ctx.fillRect(0,0,W,H);
  const workerAtlas=image({farm:gatherFarmWorkersUrl,mine:gatherMineWorkersUrl,depot:gatherDepotWorkersUrl,gold:gatherMineWorkersUrl}[site.kind]);
  const wagon=image(gatherWagonUrl),count=visibleWorkerCount(mission.roster),columns=Math.min(8,Math.max(1,Math.ceil(Math.sqrt(count*1.8))));
  if(wagon.complete&&wagon.naturalWidth)ctx.drawImage(wagon,1060,540,235,165);
  if(!workerAtlas.complete||!workerAtlas.naturalWidth)return;
  const rows=Math.ceil(count/columns),rowGap=Math.min(90,350/Math.max(1,rows-1));
  for(let i=0;i<count;i++){
    const row=Math.floor(i/columns),col=i%columns,itemsOnRow=Math.min(columns,count-row*columns);
    const x=800+(col-(itemsOnRow-1)/2)*138+(row%2?23:0),y=425+row*rowGap;
    drawGatherWorker(workerAtlas,i,x,y,site.kind);
  }
}
function updateGather(dt){
  if(!mission||mission.state!=='collecting')return;
  mission.progress+=dt/15;$('gatherProgress').style.width=`${Math.min(100,mission.progress*100)}%`;
  if(mission.ambushed&&mission.progress>=.58){mission.state='ambush';const e=ambushEncounter(mission.site,playerWorldTier(city,victories.size));$('gatherStatus').textContent='Toplama durdu!';$('ambushInfo').textContent=`${e.archers} okçu · ${e.infantry} piyade · ${e.cavalry} süvari · Seviye ${e.level}. Savaşabilir veya toplanan kaynakları bırakıp çekilebilirsiniz.`;$('ambushPanel').classList.remove('hidden')}
  else if(mission.progress>=1){
    mission.state='done';const result=finishMission(true);openCity();
    const {earned,losses,roster}=result;
    const report=`Toplanan: ${earned.gold} altın · ${earned.ore} maden · ${earned.food} yiyecek. Yolda kaybedilen: ${totalTroops(losses)} asker. Şehre dönen: ${totalTroops(roster)} asker. ${earned.food===0?'Yiyecek ambarı doluysa fazla yiyecek alınmaz.':''}`;
    $('cityMessage').textContent=report;showModal('Kaynak Toplama Tamamlandı',report,true,'gatherComplete');
  }
}
function settleBattle(){
  if(battleSettled||!battleRosterAtStart||phase==='deploy')return;
  const survivors={},survivingArmor={};
  for(const type of Object.keys(UNIT_ICON)){
    survivors[type]=squads.filter(s=>s.team==='blue'&&s.type===type).reduce((n,s)=>n+aliveCount(s),0);
    survivingArmor[type]=squads.filter(s=>s.team==='blue'&&s.type===type).flatMap(s=>s.units.filter(u=>u.hp>0&&u.armorHits>0).map(u=>u.armorLevel));
    if(battleMission)battleMission.roster[type]=survivors[type];
  }
  city=reconcileBattleResult(city,battleRosterAtStart,survivors,survivingArmor);
  battleSettled=true;saveCity();
}
function setView(next){audio.setBattleMusic(next==='map'?'map':next==='city'?'home':next==='battle'?(activeEncounter.kind==='city'?'city':'army'):null);if(view==='battle'&&next==='map'&&phase!=='ended'){settleBattle();if(battleRaid)finishRaid(false,true);finishMission(false);phase='ended'}if(view==='gather'&&next==='map'&&mission){finishMission(false)}if(next!=='city')$('cityInfo').classList.add('hidden');view=next;$('app').dataset.screen=next;if(next==='map'){paused=false;$('gameModal').classList.add('hidden');$('splitDialog').classList.add('hidden');audio.setTerrain(null,true);renderCity()}else if(next==='city'){image(playerCityUrl)}else if(next==='gather'){audio.setTerrain(mission.site.terrain,true,mission.site.variant)}else{image(terrainImage(activeEncounter));for(const team of ['blue','red'])for(const type of Object.keys(UNIT_ICON))image(spriteUrls[team][type]);audio.setTerrain(activeEncounter.terrain,true,activeEncounter.variant||0)}showRaidAlert()}

function makeSquad(team,type,count,x,y){const gear=team==='blue'?{...city.equipment[type]}:{...(activeEncounter.gear||{stars:activeEncounter.level,weapon:activeEncounter.level,armor:activeEncounter.level-1,arrows:activeEncounter.level})};const armored=team==='blue'?Math.min(count,city.armoredCounts[type]||0):Math.min(count,Math.round(count*(activeEncounter.armored||count)/(activeEncounter.archers+activeEncounter.infantry+activeEncounter.cavalry)));return {id:'birlik-'+nextSquadId++,team,type,gear,x,y,homeX:x,homeY:y,waypoint:null,afterMove:null,mode:team==='blue'?'defend':'attack',units:Array.from({length:count},(_,i)=>{const armorLevel=i<armored?(team==='blue'?city.armorWorn[type]?.[i]||gear.armor:gear.armor):0;return {hp:unitHealth(type,gear),armorLevel,armorHits:armorHitCapacity(armorLevel)}}),cooldown:Math.random()*.45,fled:false}}
async function beginEncounter(e,expedition=null){
  if(!expedition&&victories.has(e.id)){toast(e.kind==='city'?'Bu şehir zaten senin kontrolünde.':'Bu ordu zaten yenildi.');selectEncounter(e);return}
  audio.unlock();
  audio.music.prepare(e.kind==='city'?'city':'army');
  const loadId=++battleLoadId,background=image(terrainImage(e));
  const battleArt=[...new Set([background,...modularUrls.map(image)])];
  if(battleArt.some(asset=>!asset.complete||!asset.naturalWidth)){
    toast('Savaş alanı hazırlanıyor…');$('enterBattleBtn').disabled=true;
    try{await Promise.all(battleArt.map(asset=>asset.complete&&asset.naturalWidth?Promise.resolve():asset.decode()))}catch{if(loadId===battleLoadId){$('enterBattleBtn').disabled=false;battleRaid=null;toast('Savaş görselleri yüklenemedi. Tekrar deneyin.')}return}
  }
  if(loadId!==battleLoadId)return;
  $('enterBattleBtn').disabled=false;
  settleBattle();
  activeEncounter=e;nextSquadId=1;arrows=[];sparks=[];unitSpriteCache.clear();lastCardsSignature='';phase='deploy';paused=false;speed=1;battleElapsed=0;battleLoot={};
  scene=makeBattleScene(e);effects.reset();
  battleMission=expedition;const roster=expedition?.roster||city.roster;battleRosterAtStart={...roster};battleSettled=false;
  squads=[makeSquad('blue','archer',roster.archer,320,430),makeSquad('blue','infantry',roster.infantry,415,565),makeSquad('blue','cavalry',roster.cavalry,250,650),makeSquad('red','archer',e.archers,1200,300),makeSquad('red','infantry',e.infantry,1070,355),makeSquad('red','cavalry',e.cavalry,1180,190)];
  for(const s of squads){const p=nearestWalkable(scene,s.x,s.y);s.x=p.x;s.y=p.y;s.homeX=p.x;s.homeY=p.y}
  enemyMind=makeEnemyMind(e);enemyInitial=e.archers+e.infantry+e.cavalry;
  towers=Array.from({length:e.towers},(_,i)=>{const hp=160+e.level*82;return {id:'kule-'+i,x:800+(i%4)*145,y:205+Math.floor(i/4)*85,hp,maxHp:hp,cooldown:1+i*.42,type:e.level>=4&&i%3===2?'stone':'arrow'}});
  selectedSquadId=squads[0].id;
  $('battleTitle').textContent=e.name;$('battleTerrain').textContent=(e.kind==='city'?{snow:'Karlı kale',desert:'Kumlu şehir',forest:'Orman şehri'}[e.biome]:TERRAIN_LABELS[e.terrain])+' · Seviye '+e.level;$('enemyTactic').textContent='Rakip komutan hazırlanıyor';$('enemyTowers').classList.toggle('hidden',!e.towers);$('startBtn').textContent='Savaşı Başlat';$('startBtn').disabled=false;$('startBtn').classList.remove('hidden');$('gameModal').classList.add('hidden');$('moveHint').textContent='Birlik seç → yerleştirmek için kareye dokun';
  document.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('active',Number(b.dataset.speed)===1));
  setView('battle');renderCards();updateCounts();toast('Birliği seçip kareye yerleştirin. Savaştan sonra da hareket ettirebilirsiniz.')
}
function splitEnemyFormation(types=['archer']){
  for(const type of types){const s=squads.find(q=>q.team==='red'&&q.type===type);if(!s||aliveCount(s)<8)continue;const size=Math.floor(s.units.length*.55),parts=[s.units.slice(0,size),s.units.slice(size)];const index=squads.indexOf(s);const spread=type==='archer'?132:110;const pair=parts.map((units,i)=>{const p=nearestWalkable(scene,s.x+(i?spread:-spread),s.y+(i?44:-25)),q=makeSquad('red',type,0,p.x,p.y);q.units=units;q.damageReduction=s.damageReduction;return q});squads.splice(index,1,...pair)}
  enemyMind.splitDone=true;
}
function enemyOrder(s,mode,x,y,afterMove=null){
  s.mode=mode;s.focusTargetId=null;
  if(mode==='move'){const p=snapToGrid(x,y);s.waypoint=nearestWalkable(scene,p.x,p.y);s.afterMove=afterMove}
  else{s.waypoint=null;s.afterMove=null;if(mode==='defend'){s.homeX=s.x;s.homeY=s.y}}
}
function enemyThink(dt){
  if(!enemyMind||phase!=='battle')return;
  enemyMind.nextThink-=dt;if(enemyMind.nextThink>0)return;
  const reds=squads.filter(s=>s.team==='red'&&aliveCount(s)>0),blues=squads.filter(s=>s.team==='blue'&&aliveCount(s)>0&&!s.fled);
  if(!reds.length||!blues.length)return;
  const nearest=Math.min(...reds.flatMap(r=>blues.map(b=>Math.hypot(r.x-b.x,r.y-b.y))));
  const redArchers=reds.filter(r=>r.type==='archer'),blueCavalry=blues.filter(b=>b.type==='cavalry');
  const archerDistance=redArchers.length?Math.min(...redArchers.flatMap(r=>blues.map(b=>Math.hypot(r.x-b.x,r.y-b.y)))):Infinity;
  const cavalryDistance=redArchers.length&&blueCavalry.length?Math.min(...redArchers.flatMap(r=>blueCavalry.map(b=>Math.hypot(r.x-b.x,r.y-b.y)))):Infinity;
  const playerAttacking=blues.some(b=>b.mode==='attack'||b.mode==='move'&&b.waypoint&&b.waypoint.x>b.x+55);
  const tactic=chooseTactic(enemyMind,{redLiving:reds.reduce((n,s)=>n+aliveCount(s),0),redInitial:enemyInitial,redArchers:redArchers.reduce((n,s)=>n+aliveCount(s),0),nearestDistance:nearest,terrain:activeEncounter.terrain,playerAttacking,blueClosing:blues.some(b=>b.x>650),archersExposed:archerDistance<240,playerCavalryNearArchers:cavalryDistance<360,playerCavalryCharging:blueCavalry.some(b=>b.mode==='attack'&&b.x>480)});
  const weak=[...blues].sort((a,b)=>aliveCount(a)-aliveCount(b))[0];
  const target=blues.reduce((best,s)=>aliveCount(s)>aliveCount(best)?s:best,blues[0]);
  if(tactic==='hold'){for(const r of reds)enemyOrder(r,'defend')}
  else if(tactic==='charge'){for(const r of reds)enemyOrder(r,'attack')}
  else if(tactic==='massCharge'){for(const r of reds){enemyOrder(r,'attack');r.focusTargetId=target.id}}
  else if(tactic==='focus'){for(const r of reds){enemyOrder(r,'attack');r.focusTargetId=weak.id}}
  else if(tactic==='screen'){const y=blues.reduce((sum,b)=>sum+b.y,0)/blues.length;reds.forEach((r,i)=>enemyOrder(r,'move',r.type==='archer'?Math.max(1060,weak.x+360):Math.max(825,weak.x+220),Math.max(180,Math.min(690,y+(i%3-1)*95)),'defend'))}
  else if(tactic==='flank'){for(const r of reds){if(r.type==='cavalry'||r.type==='infantry'&&enemyMind.level>=4)enemyOrder(r,'move',weak.x+80,weak.y+(r.id.charCodeAt(r.id.length-1)%2?160:-140),'attack');else enemyOrder(r,'defend')}}
  else if(tactic==='pincer'){reds.forEach((r,i)=>enemyOrder(r,'move',Math.max(520,weak.x+90),Math.max(160,Math.min(715,weak.y+(i%2?175:-175))),'attack'))}
  else if(tactic==='regroup'){reds.forEach((r,i)=>enemyOrder(r,'move',1120+(i%3)*80,225+Math.floor(i/3)*90,'defend'))}
  else if(tactic==='counter'){reds.forEach(r=>{if(r.type==='archer')enemyOrder(r,'move',1230,r.y,'defend');else{enemyOrder(r,'attack');r.focusTargetId=blueCavalry[0]?.id||target.id}})}
  else if(tactic==='towerGuard'){reds.forEach((r,i)=>enemyOrder(r,'move',1000+(i%3)*85,245+Math.floor(i/3)*80,'defend'))}
  else if(tactic==='archerRetreat'){reds.forEach((r,i)=>enemyOrder(r,'move',r.type==='archer'?1250:950,r.type==='archer'?205+(i%3)*105:285+(i%3)*100,'defend'))}
  else if(tactic==='archerSplit'){
    if(!enemyMind.splitDone)splitEnemyFormation(['archer']);
    squads.filter(r=>r.team==='red'&&aliveCount(r)).forEach((r,i)=>enemyOrder(r,'move',r.type==='archer'?Math.max(580,weak.x+140):1000,r.type==='archer'?Math.max(140,Math.min(720,weak.y+(i%2?230:-220))):310+(i%3)*95,r.type==='archer'?'attack':'defend'));
  }
  else if(tactic==='bait'){reds.forEach((r,i)=>enemyOrder(r,'move',r.type==='archer'?1250:1060,195+(i%4)*105,'defend'))}
  else if(tactic==='envelop'){reds.forEach((r,i)=>enemyOrder(r,'move',Math.max(540,target.x+100),Math.max(130,Math.min(750,target.y+(i%2?260:-250))),'attack'))}
  $('enemyTactic').textContent=`Rakip Lv.${enemyMind.level}: ${TACTIC_LABELS[tactic]}`;
}
function selectedSquad(){return squads.find(s=>s.id===selectedSquadId&&s.team==='blue')}
let lastCardsSignature='';
function renderCards(){const friendly=squads.filter(s=>s.team==='blue'),signature=friendly.map(s=>`${s.id}:${aliveCount(s)}:${s.mode}:${s.id===selectedSquadId}`).join('|');if(signature===lastCardsSignature)return;lastCardsSignature=signature;const holder=$('squadCards'),scroll=holder.scrollLeft;holder.innerHTML='';for(const s of friendly){const btn=document.createElement('button');btn.className='squad-card'+(s.id===selectedSquadId?' selected':'')+(aliveCount(s)===0?' dead':'');btn.dataset.id=s.id;const count=aliveCount(s),same=friendly.filter(q=>q.type===s.type),n=same.indexOf(s)+1;btn.innerHTML='<span class=\"emoji\">'+UNIT_ICON[s.type]+'</span><span><strong>'+count+' '+UNIT_LABELS[s.type]+'</strong><small>Grup '+n+' · '+modeLabel(s.mode)+'</small></span>';holder.appendChild(btn)}holder.scrollLeft=scroll;syncCommandButtons()}
function modeLabel(mode){return {attack:'Hücum',defend:'Savunma',move:'Hareket',retreat:'Çekiliyor'}[mode]||mode}
function syncCommandButtons(){const m=selectedSquad()?.mode;for(const [id,mode] of [['attackBtn','attack'],['defendBtn','defend'],['retreatBtn','retreat']])$(id).classList.toggle('active',m===mode)}
function selectSquad(id){const s=squads.find(q=>q.id===id&&q.team==='blue');if(!s)return;selectedSquadId=id;renderCards();toast(aliveCount(s)+' '+UNIT_LABELS[s.type]+' seçildi. Kareye dokunarak hareket ettirin.')}
function showSoldierInfo(s){
  if(!s)return;
  const roles={archer:'Uzaktan hasar verir. Piyadelerin arkasında tutun; yüksek veya arka mevziden daha etkili atış yapar. Yakında ve süvari hücumuna açıkken savunmasızdır.',infantry:'Yakın dövüş hattı kurar. Okçuların önünde ve yakınında savunmada bekletildiğinde süvari hücumunu durdurur, okçuların aldığı hasarı azaltır.',cavalry:'Hızlı kanat saldırısı yapar. Açıkta kalan okçulara çok güçlü vurur; savunmadaki piyadeye önden hücum etmekten kaçının.'};
  const foe=squads.filter(q=>q.team!==s.team&&aliveCount(q)).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0];
  const state=foe?positionModifier(s,foe,squads,activeEncounter.terrain):{multiplier:1,notes:[]};
  const incoming=foe?positionModifier(foe,s,squads,activeEncounter.terrain):{multiplier:1,notes:[]};
  const base=Math.round(baseStrikeDamage(s.type,s.gear));
  $('cityInfoTitle').textContent=`${s.team==='blue'?'Mavi':'Rakip'} ${UNIT_LABELS[s.type]} · ${aliveCount(s)} asker`;
  $('cityInfoBody').textContent=roles[s.type];
  $('cityInfoArt').innerHTML=`<div role="img" aria-label="${UNIT_LABELS[s.type]}" class="soldier-info-image" style="background-image:url('${rankAtlases[s.team][s.type]}');background-position:${((s.gear.stars-1)%3)*50}% ${s.gear.stars>3?100:0}%"></div>`;
  $('cityInfoStats').innerHTML=[['Asker seviyesi',`${s.gear.stars} yıldız`],['Temel can',`${unitHealth(s.type,s.gear)} / asker`],['Temel hasar',`${base} / vuruş · hedef türünden bağımsız`],['Mevziye göre saldırı',`${Math.round(base*state.multiplier)} / vuruş · %${Math.round(state.multiplier*100)}`],['Gelen hasar etkisi',`%${Math.round(incoming.multiplier*100)} · ${incoming.notes.join(', ')||'açık mevzi'}`],['Zırh / kalkan',`${s.gear.armor||0} / ${s.gear.shield||0} · ayrıca korur`],['Menzil',`${specs[s.type].range} kare birimi`]].map(([label,value])=>`<div><span>${label}</span><b>${value}</b></div>`).join('');
  $('cityInfoCost').textContent='Konumu değiştirdiğinizde hasar ve korunma anında yeniden hesaplanır.';
  $('cityInfo').classList.remove('hidden');
}
function updateCounts(){for(const type of Object.keys(UNIT_ICON)){const n=squads.filter(s=>s.team==='red'&&s.type===type).reduce((a,s)=>a+aliveCount(s),0);$(type==='archer'?'enemyArchers':type==='infantry'?'enemyInfantry':'enemyCavalry').textContent=UNIT_ICON[type]+' '+n}$('enemyTowers').textContent='♜ '+towers.filter(t=>t.hp>0).length}

let gridLayer=null;
function drawBattleGrid(){if(!gridLayer){gridLayer=document.createElement('canvas');gridLayer.width=W;gridLayer.height=H;const g=gridLayer.getContext('2d');g.beginPath();g.moveTo(55,425);g.lineTo(1050,100);g.lineTo(1550,430);g.lineTo(555,830);g.closePath();g.clip();g.strokeStyle='rgba(234,242,228,.33)';g.lineWidth=1.5;const ox=80,oy=384;for(let i=-17;i<30;i++){g.beginPath();for(let j=-25;j<30;j++){const x=ox+54*(i+j),y=oy+27*(i-j);j===-25?g.moveTo(x,y):g.lineTo(x,y)}g.stroke()}for(let j=-25;j<30;j++){g.beginPath();for(let i=-17;i<30;i++){const x=ox+54*(i+j),y=oy+27*(i-j);i===-17?g.moveTo(x,y):g.lineTo(x,y)}g.stroke()}}ctx.drawImage(gridLayer,0,0)}
function renderBattle(){
  const e=activeEncounter,im=image(terrainImage(e));
  if(im.complete&&im.naturalWidth){
    const zoom=1.055+(e.sceneSeed%4)*.012,shiftX=((e.sceneSeed*37)%65)-32,shiftY=((e.sceneSeed*23)%37)-18;
    const sx=Math.max(0,Math.min(W-W/zoom,(W-W/zoom)/2+shiftX));
    const sy=Math.max(0,Math.min(H-H/zoom,(H-H/zoom)/2+shiftY));
    ctx.drawImage(im,sx*im.naturalWidth/W,sy*im.naturalHeight/H,im.naturalWidth/zoom,im.naturalHeight/zoom,0,0,W,H);
    drawCanopySway(ctx,scene,im,{sx,sy,zoom},mapTime);
  }else drawCover(terrainImage(e));
  drawBattleEnvironment(ctx,scene,mapTime);
  drawBattleGrid();for(const t of towers)if(t.hp>0)drawTower(t);
  for(const s of squads.filter(s=>aliveCount(s)&&!s.fled).sort((a,b)=>a.y-b.y))drawSquad(s);
  effects.draw(ctx);
  for(const a of arrows)drawArrow(a);for(const p of sparks)drawSpark(p)
}
function drawTower(t){ctx.save();ctx.fillStyle='#2d160ec7';ctx.strokeStyle=t.type==='stone'?'#e0a16f':'#e0ba76';ctx.lineWidth=3;ctx.beginPath();ctx.arc(t.x,t.y,23,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.font='bold 28px Georgia';ctx.textAlign='center';ctx.fillStyle='#f2ddaa';ctx.fillText(t.type==='stone'?'◈':'♜',t.x,t.y+9);ctx.fillStyle='#311b16';ctx.fillRect(t.x-25,t.y+27,50,6);ctx.fillStyle='#c44931';ctx.fillRect(t.x-24,t.y+28,48*t.hp/t.maxHp,4);ctx.restore()}
function drawSquad(s){const total=aliveCount(s),max=Math.min(total,s.type==='cavalry'?8:12);if(!max)return;const chosen=s.id===selectedSquadId&&s.team==='blue';if(s.mode==='move'&&s.waypoint&&chosen){ctx.strokeStyle='#65d8f8';ctx.lineWidth=3;ctx.setLineDash([8,7]);ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.waypoint.x,s.waypoint.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#73dfff';ctx.beginPath();ctx.arc(s.waypoint.x,s.waypoint.y,8,0,Math.PI*2);ctx.fill()}
  const im=image(spriteUrls[s.team][s.type]);const cols=s.type==='cavalry'?3:4,spacing=s.type==='cavalry'?60:45,rowSpacing=s.type==='cavalry'?52:38;
  const visibleUnits=s.units.filter(u=>u.hp>0);
  for(let i=0;i<max;i++){const col=i%cols,row=Math.floor(i/cols),x=s.x+(col-(Math.min(cols,max)-1)/2)*spacing+row*7,groundY=s.y+row*rowSpacing;const active=phase==='battle',moving=active&&(s.mode==='move'||s.mode==='attack'||s.mode==='retreat'),motion=active?(moving?3.5:1.1):0,bob=Math.sin(mapTime*(moving?8:2)+i*1.8)*motion;if(chosen){ctx.fillStyle=`rgba(32,186,242,${.13+.07*Math.sin(mapTime*2.5)})`;ctx.strokeStyle='#58d9fb';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-25,groundY+5);ctx.lineTo(x+2,groundY-9);ctx.lineTo(x+29,groundY+5);ctx.lineTo(x+2,groundY+19);ctx.closePath();ctx.fill();ctx.stroke()}drawUnit(im,x,groundY+bob,s,visibleUnits[i]);if(s.type==='cavalry'&&i%3===0)drawBanner(x+12,groundY-54,s.team,s.team==='red'&&!active)}
  ctx.save();ctx.font='bold 16px Georgia';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#121a13';ctx.fillStyle=s.team==='blue'?'#d8f4ff':'#ffe0d4';const label=total+' '+UNIT_LABELS[s.type];ctx.strokeText(label,s.x,s.y-83);ctx.fillText(label,s.x,s.y-83);ctx.restore()
}
function drawAtlasPiece(url,level,x,y,w,h,c=ctx){const im=image(url);if(!im.complete||!im.naturalWidth)return false;const cell=atlasCell(level,im.naturalWidth,im.naturalHeight);c.drawImage(im,cell.x,cell.y,cell.w,cell.h,x,y,w,h);return true}
function paintUnit(c,im,s,u){const {type,team,gear:g}=s,size=type==='cavalry'?126:104;c.fillStyle='#10120f50';c.beginPath();c.ellipse(0,5,type==='cavalry'?31:18,7,0,0,Math.PI*2);c.fill();if(type==='archer')drawAtlasPiece(gearAtlases.arrows,g.arrows||1,12,-75,20,31,c);const drawn=drawAtlasPiece(rankAtlases[team][type],g.stars||1,-size/2,-size,size,size,c);if(!drawn&&im.complete&&im.naturalWidth){const h=type==='cavalry'?95:73,w=h*im.naturalWidth/im.naturalHeight;c.drawImage(im,-w/2,-h,w,h)}if(u?.armorHits>0){const cavalry=type==='cavalry';drawAtlasPiece(gearAtlases.armor,u.armorLevel,cavalry?4:-15,cavalry?-101:-70,cavalry?31:34,cavalry?33:37,c)}if(type==='archer')drawAtlasPiece(gearAtlases.bow,g.weapon||1,-33,-82,37,57,c);else{if(g.shield>0)drawAtlasPiece(gearAtlases.shield[team],g.shield,type==='cavalry'?1:-30,type==='cavalry'?-82:-65,type==='cavalry'?24:29,type==='cavalry'?33:40,c);const weapon=g.weaponStyle==='balta'?gearAtlases.axe:g.weaponStyle==='mızrak'?gearAtlases.spear:gearAtlases.sword;drawAtlasPiece(weapon,g.weapon||1,type==='cavalry'?16:7,type==='cavalry'?-119:-84,type==='cavalry'?39:43,type==='cavalry'?61:58,c)}}
function drawUnit(im,x,y,s,u){const {type,team,gear:g}=s,armor=u?.armorHits>0?u.armorLevel:0,weapon=type==='archer'?gearAtlases.bow:g.weaponStyle==='balta'?gearAtlases.axe:g.weaponStyle==='mızrak'?gearAtlases.spear:gearAtlases.sword,required=[rankAtlases[team][type],weapon];if(type==='archer')required.push(gearAtlases.arrows);else if(g.shield>0)required.push(gearAtlases.shield[team]);if(armor)required.push(gearAtlases.armor);const ready=required.every(url=>{const asset=image(url);return asset.complete&&asset.naturalWidth});if(!ready){ctx.save();ctx.translate(x,y);ctx.scale(team==='blue'?-.72:.72,.72);paintUnit(ctx,im,s,u);ctx.restore();return}const key=[team,type,g.stars,g.weapon,g.arrows,g.shield,g.weaponStyle,armor].join(':');let sprite=unitSpriteCache.get(key);if(!sprite){sprite=document.createElement('canvas');sprite.width=160;sprite.height=160;const c=sprite.getContext('2d');c.translate(80,145);c.scale(team==='blue'?-.72:.72,.72);paintUnit(c,im,s,u);unitSpriteCache.set(key,sprite)}ctx.drawImage(sprite,x-80,y-145)}
function drawBanner(x,y,team,still=false){const wave=still?0:Math.sin(mapTime*4+x*.05)*5,colour=team==='blue'?'#3767ad':'#a42e2c';ctx.save();ctx.strokeStyle='rgba(28,28,27,.62)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y+28);ctx.lineTo(x,y-13);ctx.stroke();ctx.fillStyle=colour;ctx.globalAlpha=.82;ctx.beginPath();ctx.moveTo(x,y-13);ctx.quadraticCurveTo(x+11,y-17+wave*.25,x+23+wave,y-8+wave*.35);ctx.quadraticCurveTo(x+11,y-4+wave*.25,x,y-3);ctx.closePath();ctx.fill();ctx.restore()}
function drawArrow(a){if(a.kind==='stone'){ctx.fillStyle='#514d46';ctx.strokeStyle='#d2bca0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(a.x,a.y,7,0,Math.PI*2);ctx.fill();ctx.stroke();return}ctx.strokeStyle=a.team==='blue'?'#e8dbad':'#c4a5a0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x-a.vx*.04,a.y-a.vy*.04);ctx.stroke()}
function drawSpark(p){ctx.save();ctx.globalAlpha=p.life/.35;ctx.strokeStyle='#ffe09e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,8*(1-p.life/.35),0,Math.PI*2);ctx.stroke();ctx.restore()}

function nearestTarget(s){const foes=squads.filter(q=>q.team!==s.team&&aliveCount(q)>0&&!q.fled).map(q=>({target:q,d:Math.hypot(q.x-s.x,q.y-s.y)}));if(s.team==='blue')for(const t of towers.filter(t=>t.hp>0))foes.push({target:t,d:Math.hypot(t.x-s.x,t.y-s.y)+120});foes.sort((a,b)=>a.d-b.d);const focused=foes.find(item=>item.target.id===s.focusTargetId);return focused&&focused.d<900?focused.target:foes[0]?.target}
function targetPoint(t){return {x:t.x,y:t.y}}
function targetAlive(t){return 'units' in t?aliveCount(t)>0:t.hp>0}
function applyDamage(t,damage){if(!t||!targetAlive(t))return;if(!('units' in t)){t.hp=Math.max(0,t.hp-damage);return}let remaining=damage;for(const u of t.units){if(u.hp<=0)continue;const result=applyArmorHit(u,remaining);remaining-=result.usedRaw;if(result.broke&&u.hp>0)effects.impact(scene,t.x,t.y);if(remaining<=.001)break}}
function shoot(s,target){const n=aliveCount(s);if(!n)return;const base='units' in target?strikeDamage(s.type,s.gear,target.type,{...target.gear,armor:0},n):specs[s.type].damage*Math.sqrt(n)*(1+.35*(s.gear.stars-1));const damage=base*('units' in target?positionModifier(s,target,squads,activeEncounter.terrain).multiplier:1);const isArrow=s.type==='archer';if(isArrow){const duration=.48;arrows.push({x:s.x,y:s.y-40,vx:(target.x-s.x)/duration,vy:(target.y-s.y)/duration,target,life:duration,team:s.team,damage,kind:'arrow'});audio.cue('arrow')}else{applyDamage(target,damage);effects.impact(scene,target.x,target.y);sparks.push({x:target.x,y:target.y-35,life:.35});audio.cue('sword');if(s.type==='cavalry'&&Math.random()<.12)audio.cue('neigh')}}
function updateBattle(dt){if(paused||phase!=='battle'||!$('splitDialog').classList.contains('hidden'))return;battleElapsed+=dt;enemyThink(dt);for(const s of squads){if(!aliveCount(s)||s.fled)continue;const spec=specs[s.type],target=nearestTarget(s);if(s.team==='blue'&&s.mode==='retreat'){s.waypoint={x:80,y:Math.min(775,s.y+70)}}
    let dest=null;if(s.mode==='move'||s.mode==='retreat')dest=s.waypoint;else if(s.mode==='attack'&&target){const d=Math.hypot(target.x-s.x,target.y-s.y);if(d>spec.range+(s.type==='archer'?0:10))dest=targetPoint(target)}else if(s.mode==='defend'&&Math.hypot(s.homeX-s.x,s.homeY-s.y)>8)dest={x:s.homeX,y:s.homeY};
    if(dest){const d=Math.hypot(dest.x-s.x,dest.y-s.y);if(d>5){const terrainSpeed=surfaceAt(scene,s.x,s.y)==='water'?.72:1;const step=Math.min(d,spec.speed*dt*terrainSpeed);const next=advanceOnScene(scene,s,dest,step),moved=Math.hypot(next.x-s.x,next.y-s.y);s.x=next.x;s.y=next.y;if(moved>0){effects.movement(scene,s.x,s.y,dt,Math.min(3,Math.sqrt(aliveCount(s))/2),s.type==='cavalry');if(activeEncounter.terrain==='desert'&&s.team==='blue'&&s.type!=='cavalry')audio.cue('sand');if(s.type==='cavalry'){audio.cue('gallop');if(Math.random()<.0015)audio.cue('neigh')}}}else if(s.mode==='move'){s.mode=s.afterMove||'defend';s.afterMove=null;s.homeX=s.x;s.homeY=s.y;s.waypoint=null;if(s.team==='blue')renderCards()}else if(s.mode==='retreat'){s.fled=true;continue}}
    if(s.mode==='retreat'||!target||!targetAlive(target))continue;const dist=Math.hypot(target.x-s.x,target.y-s.y);s.cooldown-=dt;if(dist<spec.range+18&&s.cooldown<=0){s.cooldown=spec.delay*(.85+Math.random()*.3);shoot(s,target)}
  }
  for(const t of towers){if(t.hp<=0)continue;t.cooldown-=dt;if(t.cooldown<=0){t.cooldown=t.type==='stone'?4.5:1.55+Math.random()*.45;const blue=squads.filter(s=>s.team==='blue'&&aliveCount(s)&&!s.fled).sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y))[0];if(blue){const travel=t.type==='stone'?.8:.5;arrows.push({x:t.x,y:t.y-35,vx:(blue.x-t.x)/travel,vy:(blue.y-t.y)/travel,target:blue,life:travel,team:'red',damage:t.type==='stone'?85+activeEncounter.level*13:35+activeEncounter.level*8,kind:t.type});audio.cue(t.type==='stone'?'stone':'arrow')}}}
  for(let i=arrows.length-1;i>=0;i--){const a=arrows[i];a.x+=a.vx*dt;a.y+=a.vy*dt;a.life-=dt;if(a.life<=0){applyDamage(a.target,a.damage);effects.impact(scene,a.target.x,a.target.y);if(a.kind==='stone')for(const nearby of squads.filter(s=>s.team==='blue'&&s!==a.target&&aliveCount(s)&&Math.hypot(s.x-a.target.x,s.y-a.target.y)<110))applyDamage(nearby,a.damage*.32);sparks.push({x:a.target.x,y:a.target.y-22,life:.35});arrows.splice(i,1)}}
  for(let i=sparks.length-1;i>=0;i--){sparks[i].life-=dt;if(sparks[i].life<=0)sparks.splice(i,1)}
  uiAccumulator+=dt;if(uiAccumulator>.18){uiAccumulator=0;updateCounts();renderCards()}
  const blue=squads.some(s=>s.team==='blue'&&aliveCount(s)&&!s.fled),red=squads.some(s=>s.team==='red'&&aliveCount(s));
  if(!blue||(!red&&!towers.some(t=>t.hp>0))){
    phase='ended';settleBattle();lastCardsSignature='';renderCards();updateCounts();audio.setBattleMusic(null);audio.setTerrain(null,true);
    if(blue){
      if(battleRaid){const message=finishRaid(true,true);showModal('Baskın Savunuldu',message,true,'raid')}
      else if(battleMission){const reward=battleMission.reward;battleMission.ambushed=false;battleMission.state='collecting';battleMission.progress=.62;showModal('Baskın Püskürtüldü',`Savaşı kazandınız. Toplama alanındaki beklenen ganimet: ${reward.gold} altın, ${reward.ore} maden, ${reward.food} yiyecek. Kalan askerlerinizle toplamaya devam edebilir veya ganimeti bırakıp şehre dönebilirsiniz.`,true,'ambush')}
      else{
        const firstVictory=!victories.has(activeEncounter.id);
        victories.add(activeEncounter.id);
        if(activeEncounter.kind==='city'&&firstVictory)world=recordConquest(world,activeEncounter.id);
        localStorage.setItem('orman-savaslari-victories',JSON.stringify([...victories]));
        const reward=battleReward(city,activeEncounter.level,activeEncounter.kind);city=reward.city;
        const loot=firstVictory&&activeEncounter.gear?.armor>0?activeEncounter.gear.armor:0;
        if(loot)city.armorStock.push(loot);
        battleLoot={gold:reward.gold,food:reward.food,ore:reward.ore,armor:loot};
        saveCity();if(!world.pendingRaid&&isWorldConquered(encounters,victories))completeCampaign();else if(firstVictory)advanceWorldTurn(activeEncounter.biome);showModal('Savaşı Kazandınız',`${activeEncounter.name} ele geçirildi. Ganimetiniz depoya teslim edildi.`,true,'victory')
      }
    }else{if(battleRaid){const message=finishRaid(false,true);if(!campaignComplete)showModal('Baskın Sonucu',message,true,'raid')}else{finishMission(false);showModal('Yenilgi','Birlikleriniz savaş alanını kaybetti. Şehrinizde asker ve zırh geliştirin.',true,'defeat')}}
  }
}
function showModal(title,message,ended=false,kind='pause'){
  const isReport=ended&&view==='battle'&&activeEncounter&&kind!=='gatherComplete';
  $('gameModal').classList.toggle('battle-report',!!isReport);
  $('modalTitle').textContent=title;$('modalText').textContent=message;
  $('battleReportDetails').classList.toggle('hidden',!isReport);
  $('reportKicker').classList.toggle('hidden',!isReport);
  $('reportCampaignBtn').classList.toggle('hidden',!isReport||!campaignComplete);
  if(isReport){
    const report=battleReport(squads,towers,battleElapsed,battleLoot);
    $('reportKicker').textContent='CEPHE RAPORU · '+activeEncounter.name;
    $('battleReportDetails').innerHTML=`<div class="report-stats"><div><span>⏳ Savaş süresi</span><strong>${formatBattleDuration(report.seconds)}</strong><small>Oyun süresi · duraklamalar hariç</small></div><div><span>⚔ Öldürülen düşman</span><strong>${report.defeated}</strong><small>Asker</small></div><div><span>✚ Kaybettiğimiz asker</span><strong>${report.lost}</strong><small>${report.started} asker sefere katıldı</small></div><div><span>⚑ Sağ dönen asker</span><strong>${report.survived}</strong><small>Geri çekilenler dâhil</small></div></div><div class="report-table-wrap"><table><thead><tr><th>Birlik</th><th>Başlangıç</th><th>Sağ kalan</th><th>Kayıp</th><th>Düşman kaybı</th></tr></thead><tbody>${report.rows.map(row=>`<tr><th>${UNIT_LABELS[row.type]}</th><td>${row.started}</td><td>${row.survived}</td><td>${row.lost}</td><td>${row.defeated}</td></tr>`).join('')}</tbody></table></div><div class="report-loot"><strong>ELE GEÇİRİLEN GANİMET</strong><div><span>🪙 ${report.reward.gold} altın</span><span>🌾 ${report.reward.food} yiyecek</span><span>⚒ ${report.reward.ore} maden</span>${report.reward.armor?`<span>⬟ 1 adet seviye ${report.reward.armor} zırh</span>`:''}</div>${kind==='ambush'?'<small>Toplama ganimeti, sefer tamamlandığında depoya eklenecek.</small>':''}${towers.length?`<small>Yıkılan kule: ${report.towers} / ${towers.length}</small>`:''}</div>`;
  }
  $('resumeBtn').classList.toggle('hidden',ended);$('restartBtn').classList.toggle('hidden',ended);$('returnCityBtn').classList.toggle('hidden',!ended);$('continueGatherBtn').classList.toggle('hidden',kind!=='ambush');$('returnMapBtn').classList.toggle('hidden',kind==='ambush');$('gameModal').classList.remove('hidden');
}
function withdrawBattle(){if(view!=='battle'||phase==='ended')return;const survivors=squads.filter(s=>s.team==='blue').reduce((n,s)=>n+aliveCount(s),0);if(phase==='battle')settleBattle();phase='ended';const raidMessage=battleRaid?finishRaid(false,true):'';finishMission(false);audio.setBattleMusic(null);audio.setTerrain(null,true);showModal('Geri Çekildiniz',raidMessage||`${survivors} asker savaş alanından ayrıldı. Ganimet alınmadı.`,true)}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3600)}

function openSplit(){const s=selectedSquad();if(!s||aliveCount(s)<2){toast('Bu birliği bölecek kadar asker kalmadı.');return}splitParts=2;$('splitSummary').textContent=aliveCount(s)+' '+UNIT_LABELS[s.type]+' askerini gruplara dağıtın. Örneğin 20 ve 10.';$('splitDialog').classList.remove('hidden');renderSplitInputs()}
function renderSplitInputs(){const s=selectedSquad(),total=aliveCount(s);document.querySelectorAll('[data-parts]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.parts)===splitParts);b.disabled=total<Number(b.dataset.parts)});const counts=balancedCounts(total,splitParts);$('splitInputs').innerHTML='';counts.forEach((n,i)=>{const row=document.createElement('label');row.className='split-row';row.innerHTML='<span>Grup '+(i+1)+'</span><input type=\"number\" inputmode=\"numeric\" min=\"1\" max=\"'+total+'\" value=\"'+n+'\" aria-label=\"Grup '+(i+1)+' asker sayısı\">';$('splitInputs').appendChild(row)});$('splitError').textContent='Toplam '+total+' asker · Her grup en az 1 asker';$('confirmSplit').disabled=false}
function confirmSplit(){const s=selectedSquad();if(!s)return;const counts=[...$('splitInputs').querySelectorAll('input')].map(i=>Number(i.value));try{const groups=splitUnitArray(s.units,counts),index=squads.indexOf(s);const created=groups.map((units,i)=>{const spread=(i-(groups.length-1)/2)*88,cell=snapToGrid(s.x+spread,s.y+(i%2)*20),p=nearestWalkable(scene,cell.x,cell.y);const q=makeSquad('blue',s.type,0,p.x,p.y);q.units=units;q.mode='defend';return q});squads.splice(index,1,...created);selectedSquadId=created[0].id;$('splitDialog').classList.add('hidden');renderCards();toast('Birlik '+groups.length+' gruba ayrıldı. Her grubu seçip ayrı kareye gönderin.')}catch(err){$('splitError').textContent=err.message}}
function setMode(mode){if(phase==='ended')return;const s=selectedSquad();if(!s||!aliveCount(s))return;s.mode=mode;s.waypoint=null;if(mode==='defend'){s.homeX=s.x;s.homeY=s.y}else if(mode==='retreat')s.waypoint={x:80,y:Math.min(775,s.y+70)};if(phase==='battle'&&enemyMind?.level>=2)enemyMind.nextThink=Math.min(enemyMind.nextThink,.45);renderCards();toast(UNIT_LABELS[s.type]+' grubuna '+modeLabel(mode)+' emri verildi.')}

let unitPressTimer=null,unitPressTriggered=false;
canvas.addEventListener('pointerdown',e=>{const p=toWorld(e.clientX,e.clientY);pointer={start:p,last:p,moved:false};unitPressTriggered=false;clearTimeout(unitPressTimer);if(view==='battle'){const hit=squads.filter(s=>aliveCount(s)&&Math.hypot(s.x-p.x,s.y-p.y)<92).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(hit)unitPressTimer=setTimeout(()=>{unitPressTriggered=true;showSoldierInfo(hit)},550)}canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!pointer)return;const motion=toWorld(e.clientX,e.clientY);if(Math.hypot(motion.x-pointer.start.x,motion.y-pointer.start.y)>12)clearTimeout(unitPressTimer);if(view!=='map')return;const p=toWorld(e.clientX,e.clientY),d=Math.hypot(p.x-pointer.start.x,p.y-pointer.start.y);if(d>7)pointer.moved=true;if(pointer.moved){camera.x+=p.x-pointer.last.x;camera.y+=p.y-pointer.last.y;clampCamera()}pointer.last=p});
canvas.addEventListener('pointerup',e=>{clearTimeout(unitPressTimer);if(!pointer)return;if(unitPressTriggered){pointer=null;unitPressTriggered=false;return}const p=toWorld(e.clientX,e.clientY),wasDrag=pointer.moved;pointer=null;if(view==='map'){if(!wasDrag){const q=mapToWorld(p);if(Math.hypot(q.x-210,q.y-748)<34){openCity();return}const site=findResource(q),hit=findEncounter(q);if(site&&(!hit||Math.hypot(q.x-site.x,q.y-site.y)<Math.hypot(q.x-mapPosition(hit).x,q.y-mapPosition(hit).y)))selectResource(site);else if(hit){selectedResource=null;$('resourcePanel').classList.add('hidden');selectEncounter(hit)}}return}if(view==='city'||view==='gather'||paused||phase==='ended')return;const friendly=squads.filter(s=>s.team==='blue'&&aliveCount(s)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(friendly&&Math.hypot(friendly.x-p.x,friendly.y-p.y)<80){selectSquad(friendly.id);return}if(p.x<90||p.x>1510||p.y<100||p.y>770)return;const s=selectedSquad();if(!s||!aliveCount(s))return;const snapped=snapToGrid(p.x,p.y),cell=nearestWalkable(scene,snapped.x,snapped.y);if(phase==='deploy'){s.x=cell.x;s.y=cell.y;s.homeX=cell.x;s.homeY=cell.y;toast(UNIT_LABELS[s.type]+' güvenli kareye yerleştirildi.')}else{s.waypoint=cell;s.mode='move';if(enemyMind?.level>=2)enemyMind.nextThink=Math.min(enemyMind.nextThink,.6);renderCards();toast(UNIT_LABELS[s.type]+' '+Math.round(cell.x)+','+Math.round(cell.y)+' karesine ilerliyor.')}});
canvas.addEventListener('wheel',e=>{if(view==='map'){e.preventDefault();setZoom(e.deltaY<0?.12:-.12)}},{passive:false});
document.querySelectorAll('.map-filters button').forEach(btn=>btn.addEventListener('click',()=>{mapFilter=btn.dataset.filter;document.querySelectorAll('.map-filters button').forEach(b=>b.classList.toggle('active',b===btn));if(selectedEncounter&&mapFilter!=='all'&&selectedEncounter.kind!==mapFilter){selectedEncounter=null;$('intelPanel').classList.add('hidden')}if(selectedResource&&mapFilter!=='all'&&mapFilter!=='resource'){selectedResource=null;$('resourcePanel').classList.add('hidden')}}));
$('zoomIn').onclick=()=>setZoom(.2);$('zoomOut').onclick=()=>setZoom(-.2);$('closeIntel').onclick=()=>{$('intelPanel').classList.add('hidden');selectedEncounter=null};$('enterBattleBtn').onclick=()=>{if(selectedEncounter)beginEncounter(selectedEncounter)};
$('raidDefend').onclick=()=>{const raid=world.pendingRaid,target=raidTarget(raid);if(!raid||!target)return;const encounter=makeRaidEncounter(raid,target,city,victories.size);battleRaid=raid;beginEncounter(encounter).catch(()=>{battleRaid=null;showRaidAlert()})};
$('raidAuto').onclick=()=>{const raid=world.pendingRaid,target=raidTarget(raid);if(!raid||!target)return;const encounter=makeRaidEncounter(raid,target,city,victories.size),defended=autoDefendRaid(raid,encounter,city);finishRaid(defended)};
$('victoryMapBtn').onclick=()=>{$('campaignVictory').classList.add('hidden');setView('map')};
$('reportCampaignBtn').onclick=()=>completeCampaign(true);
$('victoryCityBtn').onclick=()=>{$('campaignVictory').classList.add('hidden');openCity()};
$('closeResource').onclick=()=>{$('resourcePanel').classList.add('hidden');selectedResource=null};for(const id of ['sendArcher','sendInfantry','sendCavalry'])$(id).addEventListener('input',updateExpeditionEstimate);$('sendExpedition').onclick=sendExpedition;$('gatherBack').onclick=()=>setView('map');$('fightAmbush').onclick=()=>{if(mission?.state==='ambush')beginEncounter(ambushEncounter(mission.site,playerWorldTier(city,victories.size)),mission)};$('leaveAmbush').onclick=()=>{if(mission){finishMission(false);setView('map');toast('Kaynaklar bırakıldı. Askerleriniz geri döndü.')}};
$('openCityBtn').onclick=openCity;$('cityBackBtn').onclick=()=>setView('map');
$('cityPanelToggle').onclick=()=>toggleCityPanel($('cityHud').dataset.panel!=='open');
$('cityPanelClose').onclick=()=>toggleCityPanel(false);
let cityPressTimer=null,cityPressStart=null,cityPressTriggered=false,lastCityLongPress=0;
$('cityPanel').addEventListener('pointerdown',e=>{const button=e.target.closest('[data-city-action]');if(!button)return;cityPressTriggered=false;cityPressStart={x:e.clientX,y:e.clientY};clearTimeout(cityPressTimer);cityPressTimer=setTimeout(()=>{cityPressTriggered=true;showCityInfo(button.dataset.cityAction)},550)});
$('cityPanel').addEventListener('pointermove',e=>{if(cityPressStart&&Math.hypot(e.clientX-cityPressStart.x,e.clientY-cityPressStart.y)>12){clearTimeout(cityPressTimer);cityPressStart=null}});
for(const event of ['pointerup','pointercancel','pointerleave'])$('cityPanel').addEventListener(event,()=>{clearTimeout(cityPressTimer);cityPressStart=null;if(cityPressTriggered)lastCityLongPress=Date.now()});
$('cityPanel').addEventListener('contextmenu',e=>{if(e.target.closest('[data-city-action]'))e.preventDefault()});
$('gearRows').addEventListener('input',e=>{const type=e.target.dataset.equipQty;if(type)equipDraft[type].quantity=Number(e.target.value)});
$('gearRows').addEventListener('click',e=>{const button=e.target.closest('[data-equip-picker]');if(!button)return;const type=button.dataset.equipType,kind=button.dataset.equipPicker,draft=equipDraft[type];const levels=kind==='level'?[...new Set(city.armorStock)].sort((a,b)=>b-a):[0,...new Set(city.armorWorn[type]||[])].filter(level=>level===0||level<draft.level).sort((a,b)=>a-b);$('equipPickerTitle').textContent=(kind==='level'?'Depodan zırh seç':'Askerlerin mevcut zırhını seç')+' · '+UNIT_LABELS[type];$('equipPickerOptions').innerHTML=levels.length?levels.map(level=>`<button type="button" class="equip-picker-card ${draft[kind]===level?'selected':''}" data-picker-choice="${level}" data-picker-kind="${kind}" data-picker-type="${type}"><span class="equip-picker-emblem">${level?'⬟':'◇'}</span><span><strong>${level?'Seviye '+level+' zırh':'Zırhsız asker'}</strong><small>${kind==='level'?(city.armorStock.filter(v=>v===level).length+' adet depoda'):(level?city.armorWorn[type].filter(v=>v===level).length+' asker giyiyor':'Henüz zırh giymeyen askerler')}</small></span></button>`).join(''):'<p>Seçilebilir zırh bulunmuyor.</p>';$('equipPicker').classList.remove('hidden')});
$('equipPickerOptions').addEventListener('click',e=>{const button=e.target.closest('[data-picker-choice]');if(!button)return;equipDraft[button.dataset.pickerType][button.dataset.pickerKind]=Number(button.dataset.pickerChoice);$('equipPicker').classList.add('hidden');$('gearRows').innerHTML=['archer','infantry','cavalry'].map(renderGearRow).join('')});
$('equipPickerClose').onclick=()=>$('equipPicker').classList.add('hidden');$('equipPicker').addEventListener('click',e=>{if(e.target===$('equipPicker'))$('equipPicker').classList.add('hidden')});
$('cityPanel').addEventListener('click',async e=>{const button=e.target.closest('[data-city-action]');if(!button)return;if(Date.now()-lastCityLongPress<700)return;const action=button.dataset.cityAction,type=action.split('-').at(-1),draft=equipDraft[type],quantity=action.startsWith('equip-')?draft.quantity:1,result=action==='taxes'?collectCityRevenue(city,encounters.filter(q=>q.kind==='city'&&victories.has(q.id))):cityAction(city,action,Date.now(),quantity,action.startsWith('equip-')?{level:draft.level,replaceLevel:draft.replaceLevel}:{});city=result.city;saveCity();$('cityMessage').textContent=result.message;renderCity();audio.cityCue(action,result.ok);if(action==='harvest'&&result.ok){const notification=await scheduleHarvestNotification(city.lastHarvest);$('cityMessage').textContent=result.message+(notification.scheduled?' Hazır olduğunda ve alınmadığı sürece iki saatte bir bildirim gelecek.':notification.reason==='denied'?' Bildirim izni verilmedi.':'')}});
$('cityInfoClose').onclick=$('cityInfoDismiss').onclick=()=>$('cityInfo').classList.add('hidden');
$('cityInfo').addEventListener('click',e=>{if(e.target===$('cityInfo'))$('cityInfo').classList.add('hidden')});
let cardPressTimer=null,lastCardLongPress=0;$('squadCards').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-id]');if(b){clearTimeout(cardPressTimer);cardPressTimer=setTimeout(()=>{lastCardLongPress=Date.now();showSoldierInfo(squads.find(s=>s.id===b.dataset.id))},550)}});for(const event of ['pointerup','pointercancel','pointerleave'])$('squadCards').addEventListener(event,()=>clearTimeout(cardPressTimer));$('squadCards').addEventListener('click',e=>{if(Date.now()-lastCardLongPress<700)return;const b=e.target.closest('[data-id]');if(b)selectSquad(b.dataset.id)});
$('splitBtn').onclick=openSplit;$('closeSplit').onclick=()=>$('splitDialog').classList.add('hidden');document.querySelectorAll('[data-parts]').forEach(b=>b.onclick=()=>{splitParts=Number(b.dataset.parts);renderSplitInputs()});$('confirmSplit').onclick=confirmSplit;$('splitInputs').addEventListener('input',()=>{const s=selectedSquad(),sum=[...$('splitInputs').querySelectorAll('input')].reduce((a,i)=>a+(Number(i.value)||0),0);$('splitError').textContent='Dağıtılan '+sum+' / '+aliveCount(s)+' asker';$('confirmSplit').disabled=sum!==aliveCount(s)});
$('attackBtn').onclick=()=>setMode('attack');$('defendBtn').onclick=()=>setMode('defend');$('retreatBtn').onclick=()=>setMode('retreat');$('retreatAllBtn').onclick=()=>{for(const s of squads.filter(q=>q.team==='blue'&&aliveCount(q))){s.mode='retreat';s.waypoint={x:80,y:Math.min(775,s.y+70)}}renderCards();toast('Tüm birlikler geri çekiliyor.')};
$('withdrawBattleBtn').onclick=withdrawBattle;
$('startBtn').onclick=()=>{if(phase!=='deploy')return;phase='battle';for(const s of squads.filter(q=>q.team==='blue'))if(s.mode==='defend')s.mode='attack';$('startBtn').textContent='Savaş Sürüyor';$('startBtn').disabled=true;$('moveHint').textContent='Birlik seç → hareket için kareye dokun';enemyMind.nextThink=0;enemyThink(0);renderCards();toast('Savaş başladı! Rakip komutan da taktik uyguluyor.')};
document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>{speed=Number(b.dataset.speed);document.querySelectorAll('[data-speed]').forEach(x=>x.classList.toggle('active',x===b));toast('Savaş hızı '+speed+'×')});
for(const id of ['soundBtn','mapSoundBtn','citySoundBtn'])$(id).onclick=()=>{soundOn=!soundOn;for(const key of ['soundBtn','mapSoundBtn','citySoundBtn']){$(key).textContent=soundOn?'🔊':'🔇';$(key).setAttribute('aria-label',soundOn?'Sesi kapat':'Sesi aç')}audio.setEnabled(soundOn)};
function openSaveDialog(importing){saveCity();persistWorld();$('saveTitle').textContent=importing?'Yedeği Yükle':'İlerlemeyi Yedekle';$('saveHelp').textContent=importing?'Yedek kodunu aşağıya yapıştır. Uyguladığında bu cihazdaki mevcut ilerlemenin yerini alır.':'Bu kodu kopyalayıp sakla. Web oyunundaki ilerlemeni çevrimdışı uygulamaya veya başka bir cihaza bu kodla aktarabilirsin.';$('saveCode').readOnly=!importing;$('saveCode').value=importing?'':exportSave(localStorage);$('saveMessage').textContent='';$('saveCopy').classList.toggle('hidden',importing);$('saveApply').classList.toggle('hidden',!importing);$('saveDialog').classList.remove('hidden')}
$('exportSaveBtn').onclick=()=>openSaveDialog(false);$('importSaveBtn').onclick=()=>openSaveDialog(true);$('saveClose').onclick=()=>$('saveDialog').classList.add('hidden');
$('saveCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('saveCode').value);$('saveMessage').textContent='Yedek kodu kopyalandı.'}catch{$('saveCode').focus();$('saveCode').select();$('saveMessage').textContent='Kodu seçip telefonunun Kopyala seçeneğini kullanabilirsin.'}};
$('saveApply').onclick=()=>{try{importSave($('saveCode').value,localStorage);location.reload()}catch(error){$('saveMessage').textContent='Yedek yüklenemedi. Kodu eksiksiz yapıştırdığından emin ol.'}};
$('pauseBtn').onclick=()=>{if(phase==='ended')return;paused=true;showModal('Duraklatıldı','Savaş sizi bekliyor.')};$('resumeBtn').onclick=()=>{paused=false;$('gameModal').classList.add('hidden')};$('restartBtn').onclick=()=>{if(activeEncounter)beginEncounter(activeEncounter)};$('returnCityBtn').onclick=()=>{if(battleMission)finishMission(false);$('gameModal').classList.add('hidden');openCity()};$('continueGatherBtn').onclick=()=>{if(!mission)return;$('gameModal').classList.add('hidden');$('ambushPanel').classList.add('hidden');$('gatherStatus').textContent='Kaynaklar yeniden toplanıyor...';$('gatherYield').textContent=`Savaş kazanıldı · Beklenen ganimet: ${mission.reward.gold} altın · ${mission.reward.ore} maden · ${mission.reward.food} yiyecek`;setView('gather')};$('returnMapBtn').onclick=()=>setView('map');$('mapBtn').onclick=()=>setView('map');
addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('saveDialog').classList.contains('hidden'))$('saveDialog').classList.add('hidden');else if(!$('equipPicker').classList.contains('hidden'))$('equipPicker').classList.add('hidden');else if(!$('cityInfo').classList.contains('hidden'))$('cityInfo').classList.add('hidden');else if(!$('splitDialog').classList.contains('hidden'))$('splitDialog').classList.add('hidden');else if(view==='city'&&$('cityHud').dataset.panel==='open')toggleCityPanel(false);else if(view==='battle'||view==='city')setView('map')}});
function loop(t){const dt=Math.min(.05,(t-lastFrame)/1000||0);lastFrame=t;mapTime+=dt;if(view==='battle'){effects.update(dt);updateBattle(dt*speed)}if(view==='gather')updateGather(dt);if(view==='city'){cityTick+=dt;if(cityTick>5){cityTick=0;renderCity()}}if(!campaignComplete&&(view==='map'||view==='city')){worldClock+=dt;if(worldClock>=180){worldClock=0;advanceWorldTurn()}}render();requestAnimationFrame(loop)}image(worldUrl);refreshWorld();renderCity();scheduleHarvestNotification(city.lastHarvest,false);if(campaignComplete||(!world.pendingRaid&&isWorldConquered(encounters,victories)))completeCampaign();requestAnimationFrame(loop);setTimeout(preloadBackgrounds,1800);
