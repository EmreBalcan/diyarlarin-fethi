import test from 'node:test';
import assert from 'node:assert/strict';
import {strikeDamage,unitHealth,armorHitCapacity,applyArmorHit,DEFAULT_GEAR} from './combat-math.js';
import {generateEncounters} from './game-logic.js';
import {makeCity,cityAction,gearUpgradeCost,collectCityRevenue} from './city-logic.js';
import {atlasCell} from './sprite-atlas.js';

test('equal level cavalry defeats unarmored archers in one strike, infantry in three',()=>{
  const archer=strikeDamage('cavalry',DEFAULT_GEAR,'archer',DEFAULT_GEAR);
  const infantry=strikeDamage('cavalry',DEFAULT_GEAR,'infantry',DEFAULT_GEAR);
  assert.ok(archer>=unitHealth('archer',DEFAULT_GEAR));
  assert.ok(infantry*2<unitHealth('infantry',DEFAULT_GEAR));
  assert.ok(infantry*3>=unitHealth('infantry',DEFAULT_GEAR));
  assert.ok(strikeDamage('cavalry',DEFAULT_GEAR,'archer',{...DEFAULT_GEAR,armor:3})<unitHealth('archer',DEFAULT_GEAR));
  assert.ok(strikeDamage('cavalry',{stars:5,weapon:5,armor:0,arrows:1},'archer',{...DEFAULT_GEAR,armor:3})>=unitHealth('archer',DEFAULT_GEAR));
});
test('attack power does not change with target class; equipment protects separately',()=>{
  const archer=strikeDamage('cavalry',DEFAULT_GEAR,'archer',DEFAULT_GEAR);
  const infantry=strikeDamage('cavalry',DEFAULT_GEAR,'infantry',DEFAULT_GEAR);
  const horse=strikeDamage('cavalry',DEFAULT_GEAR,'cavalry',DEFAULT_GEAR);
  assert.equal(archer,infantry);
  assert.equal(infantry,horse);
  assert.ok(strikeDamage('cavalry',DEFAULT_GEAR,'infantry',{...DEFAULT_GEAR,shield:2})<infantry);
});
test('level five equipment decisively outclasses level one in offense and endurance',()=>{
  const veteran={stars:5,weapon:5,armor:4,arrows:5,shield:5};
  const rookieDamage=strikeDamage('infantry',DEFAULT_GEAR,'infantry',DEFAULT_GEAR);
  const veteranDamage=strikeDamage('infantry',veteran,'infantry',DEFAULT_GEAR);
  assert.ok(veteranDamage>rookieDamage*3.5);
  const veteranHit=strikeDamage('infantry',DEFAULT_GEAR,'infantry',veteran);
  assert.ok(veteranHit<rookieDamage*.4);
  assert.ok(unitHealth('infantry',veteran)>unitHealth('infantry',DEFAULT_GEAR)*1.6);
});
test('enemy armies vary from small patrols to large formations; cities have 200+ defenders',()=>{
  const all=generateEncounters(),armies=all.filter(e=>e.kind==='army'),cities=all.filter(e=>e.kind==='city');
  const count=e=>e.archers+e.infantry+e.cavalry;
  assert.ok(cities.every(e=>count(e)>=200));
  assert.ok(Math.min(...armies.map(count))<=80);
  assert.ok(Math.max(...armies.map(count))>=250);
  assert.ok(new Set(all.map(e=>e.gear.weapon)).size>=4);
});
test('produced armor can be assigned to one troop type and conquered cities pay periodic revenue',()=>{
  let city=makeCity({gold:4000,ore:1000,food:1000});
  city=cityAction(city,'armor').city;
  assert.equal(city.armorStock.length,10);
  city=cityAction(city,'equip-archer').city;
  assert.equal(city.equipment.archer.armor,1);
  assert.equal(city.armoredCounts.archer,1);
  assert.equal(city.armoredCounts.infantry,0);
  assert.equal(city.equipment.infantry.armor,0);
  const held=generateEncounters().filter(e=>e.kind==='city').slice(0,2);
  const result=collectCityRevenue(city,held,200000);
  assert.ok(result.ok&&result.city.gold>city.gold);
  assert.equal(collectCityRevenue(result.city,held,200001).ok,false);
});
test('armor protects a living soldier for level-dependent hits and then breaks',()=>{
  const unit={hp:200,armorLevel:2,armorHits:armorHitCapacity(2)};
  assert.equal(unit.armorHits,7);
  for(let i=0;i<7;i++){const result=applyArmorHit(unit,10);assert.ok(result.hpDamage<10)}
  assert.equal(unit.armorLevel,0);
  assert.equal(unit.armorHits,0);
  assert.equal(applyArmorHit(unit,10).hpDamage,10);
});
test('city lists exact upgrade costs and equips one produced armor item to one soldier',()=>{
  let city=makeCity({gold:5000,food:3000,ore:1000});
  assert.deepEqual(gearUpgradeCost(city.equipment.archer,'stars'),{gold:131,food:80});
  assert.deepEqual(gearUpgradeCost(city.equipment.archer,'weapon'),{gold:108,ore:43});
  city=cityAction(city,'armor').city;
  city=cityAction(city,'equip-infantry').city;
  assert.equal(city.armoredCounts.infantry,1);
  assert.equal(city.armorStock.length,9);
});
test('ten forged armor pieces can be split five and five, then upgraded',()=>{
  let city=makeCity({gold:10000,ore:10000});
  city=cityAction(city,'armor').city;
  city=cityAction(city,'equip-archer',Date.now(),5).city;
  city=cityAction(city,'equip-infantry',Date.now(),5).city;
  assert.equal(city.armorStock.length,0);
  assert.equal(city.armoredCounts.archer,5);
  assert.equal(city.armoredCounts.infantry,5);
  assert.deepEqual(city.armorWorn.archer,[1,1,1,1,1]);
  city=cityAction(city,'forge').city;
  city=cityAction(city,'armor-upgrade-archer').city;
  assert.deepEqual(city.armorWorn.archer,[2,2,2,2,2]);
  assert.deepEqual(city.armorWorn.infantry,[1,1,1,1,1]);
  assert.equal(armorHitCapacity(city.armorWorn.archer[0]),7);
});
test('five visual ranks have distinct atlas cells and shield upgrades are class-specific',()=>{
  const cells=Array.from({length:5},(_,i)=>atlasCell(i+1,1536,1024));
  assert.equal(new Set(cells.map(c=>`${c.x},${c.y}`)).size,5);
  assert.deepEqual(cells[4],{x:512,y:512,w:512,h:512});
  let city=makeCity({gold:4000,ore:1000,food:1000});
  const before=city.equipment.infantry.shield;
  city=cityAction(city,'shield-infantry').city;
  assert.equal(city.equipment.infantry.shield,before+1);
  assert.equal(city.equipment.cavalry.shield,0);
  assert.ok(strikeDamage('cavalry',DEFAULT_GEAR,'infantry',{...DEFAULT_GEAR,shield:3})<strikeDamage('cavalry',DEFAULT_GEAR,'infantry',DEFAULT_GEAR));
});
