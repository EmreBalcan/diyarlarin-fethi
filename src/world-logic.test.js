import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCity} from './city-logic.js';
import {makeWorld,advanceWorld,recordConquest,playerWorldTier,isWorldConquered,makeRaidEncounter,autoDefendRaid,resolveRaid} from './world-logic.js';
import {generateEncounters} from './game-logic.js';

test('unattended regions spawn armies without outrunning a new player',()=>{
  let world=makeWorld(),city=makeCity();
  const victories=new Set();
  for(let i=0;i<15;i++)world=advanceWorld(world,{focus:'forest',city,victories}).world;
  assert.equal(world.turn,15);
  assert.ok(world.armies.length>=4);
  assert.ok(world.armies.every(a=>a.biome!=='forest'&&a.level===1&&a.archers+a.infantry+a.cavalry<=120));
  assert.equal(world.cities.length,0);
  assert.equal(playerWorldTier(city,0),1);
});
test('one highly upgraded unit does not raise every new enemy to level five',()=>{
  const city=makeCity();city.equipment.archer.stars=5;city.equipment.archer.weapon=5;
  assert.ok(playerWorldTier(city,0)<5);
});

test('advanced enemies can found a city after sustained regional growth',()=>{
  let world=makeWorld(),city=makeCity();
  city.equipment.infantry.stars=3;
  const victories=new Set(Array.from({length:12},(_,i)=>`won-${i}`));
  const events=[];
  for(let i=0;i<18;i++){const result=advanceWorld(world,{focus:'forest',city,victories});world=result.world;events.push(...result.events)}
  assert.ok(world.cities.length>=1);
  assert.ok(world.cities.every(e=>e.kind==='city'&&e.towers>=4&&e.level>=3));
  assert.ok(events.some(e=>e.includes('şehrini kurdu')));
});

test('a captured city is protected from immediate recapture',()=>{
  const city=makeCity(),baseCities=[{id:'castle-1',kind:'city',biome:'snow',name:'Kuzey Kalesi'}];
  let world=recordConquest(makeWorld({turn:20,pressure:{snow:20},lastReclaim:0}),'castle-1');
  const victories=new Set(['castle-1',...Array.from({length:8},(_,i)=>`win-${i}`)]);
  for(let i=0;i<11;i++){
    const result=advanceWorld(world,{focus:'forest',city,victories,baseCities});
    world=result.world;assert.deepEqual(result.reclaimed,[]);
  }
  const result=advanceWorld(world,{focus:'forest',city,victories,baseCities});
  assert.deepEqual(result.reclaimed,['castle-1']);
  const next=advanceWorld(result.world,{focus:'forest',city,victories,baseCities});
  assert.deepEqual(next.reclaimed,[]);
});

test('late campaign can clear every enemy without endless replacement armies',()=>{
  const baseCities=[{id:'castle',kind:'city',biome:'forest',name:'Kale'}];
  const victories=new Set(['castle','last-army']);
  assert.equal(isWorldConquered([{id:'castle'},{id:'last-army'}],victories),true);
  assert.equal(isWorldConquered([{id:'castle'},{id:'last-army'},{id:'new-army'}],victories),false);
  const previous=makeWorld({turn:2,armies:[{id:'last-army',kind:'army',biome:'snow',terrain:'snow',archers:10,infantry:20,cavalry:5,armored:0,level:1,gear:{},age:0}]});
  const result=advanceWorld(previous,{focus:'forest',city:makeCity(),victories,baseCities});
  assert.equal(result.world.armies.length,0);
});

test('each conquest schedules a weaker home raid after three or four days and staggered city raids',()=>{
  let world=recordConquest(makeWorld({turn:5}),'city-a');
  world=recordConquest(world,'city-b');
  const home=world.raidQueue.filter(r=>r.kind==='home'),cityRaids=world.raidQueue.filter(r=>r.kind==='city');
  assert.equal(home.length,2);assert.equal(cityRaids.length,2);
  assert.ok(home[0].dueTurn>=9&&home[0].dueTurn<=10);
  assert.ok(home[1].dueTurn-home[0].dueTurn>=3);
  const player=makeCity(),target={id:'city-a',name:'Kale',biome:'forest',terrain:'city',level:2};
  const attacker=makeRaidEncounter(home[0],target,player,1);
  assert.ok(attacker.archers+attacker.infantry+attacker.cavalry<player.roster.archer+player.roster.infantry+player.roster.cavalry);
  assert.equal(autoDefendRaid(home[0],attacker,player),true);
  const held=new Set(['city-a','city-b']);
  while(world.turn<home[0].dueTurn){world=advanceWorld(world,{focus:'forest',city:player,victories:held,baseCities:[target]}).world}
  assert.equal(world.pendingRaid?.id,home[0].id);
  const resolved=resolveRaid(world,world.pendingRaid,true);
  assert.equal(resolved.world.pendingRaid,null);
});

test('failed captured-city defense revokes ownership and future city raids',()=>{
  let world=recordConquest(makeWorld({turn:1}),'city-a');
  world={...world,pendingRaid:world.raidQueue.find(r=>r.kind==='city')};
  const player=makeCity({roster:{archer:10,infantry:8,cavalry:5}}),target={id:'city-a',name:'Kale',biome:'snow',level:5};
  const attacker=makeRaidEncounter(world.pendingRaid,target,player,12);
  assert.equal(autoDefendRaid(world.pendingRaid,attacker,player),false);
  const result=resolveRaid(world,world.pendingRaid,false);
  assert.deepEqual(result.reclaimed,['city-a']);
  assert.equal(result.world.raidQueue.some(r=>r.targetCityId==='city-a'),false);
});
test('extended campaign spawns enemies, raids owned cities, and later reclaims an unattended city',()=>{
  const all=generateEncounters(),baseCities=all.filter(e=>e.kind==='city'),baseArmies=all.filter(e=>e.kind==='army');
  const captured=baseCities.filter(e=>e.biome==='snow').slice(0,2);
  const victories=new Set([...captured.map(e=>e.id),...baseArmies.slice(0,8).map(e=>e.id)]);
  let world=makeWorld(),city=makeCity(),spawned=0,raids=0,recaptures=0;const raidKinds=new Set();
  for(const target of captured)world=recordConquest(world,target.id);
  for(let day=0;day<35;day++){
    const result=advanceWorld(world,{focus:'forest',city,victories,baseCities,baseArmies});world=result.world;
    spawned+=result.events.filter(message=>message.includes('ortaya çıktı')).length;
    recaptures+=result.reclaimed.length;
    for(const id of result.reclaimed)victories.delete(id);
    if(world.pendingRaid){raids++;raidKinds.add(world.pendingRaid.kind);world=resolveRaid(world,world.pendingRaid,true).world}
  }
  assert.ok(spawned>=4);
  assert.ok(raids>=3);
  assert.deepEqual([...raidKinds].sort(),['city','home']);
  assert.ok(recaptures>=1);
  assert.ok(world.armies.length>0);
});
