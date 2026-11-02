import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCity,cityAction,cityActionCost,battleReward,foodCapacity,produceFood,cityRevenue,collectCityRevenue,reconcileBattleResult} from './city-logic.js';
import {enemyLevel,makeEnemyMind,chooseTactic} from './enemy-ai.js';

test('city training, armor and stores spend resources and persist as plain state',()=>{
  let city=makeCity();
  const trained=cityAction(city,'archer',1000);
  assert.equal(trained.ok,true);
  assert.equal(trained.city.roster.archer,40);
  assert.equal(trained.city.gold,city.gold-84);
  city=trained.city;
  const armor=cityAction(city,'armor',1000);
  assert.equal(armor.ok,true);
  assert.equal(armor.city.armor,1);
  assert.equal(armor.city.armorStock.length,20);
  assert.equal(armor.city.ore,city.ore-50);
  const produced=produceFood(armor.city,61000);
  assert.equal(produced.food,armor.city.food+3);
  assert.ok(foodCapacity(produced)>produced.food);
});
test('release disables free test purchases and hourly harvest grants fifty gold',()=>{
  const start=makeCity({gold:0,food:0,ore:0});
  assert.equal(cityActionCost(start,'archer').gold,84);
  assert.equal(cityAction(start,'test-mode',1000).ok,false);
  assert.equal(cityAction(makeCity({...start,testMode:true}),'armor',1000).ok,false);
  const city=cityAction(start,'harvest',3600000).city;
  assert.equal(city.gold,50);
  assert.equal(cityAction(city,'harvest',3601000).ok,false);
  assert.equal(cityAction(city,'weapon-archer',62000).ok,false);
});

test('chosen armor level equips exact count and higher armor replaces worn pieces',()=>{
  const start=makeCity({armorStock:[1,1,5,5,5],armorWorn:{archer:[2,2],infantry:[],cavalry:[]}});
  const first=cityAction(start,'equip-archer',1000,1,{level:1,replaceLevel:0});
  assert.equal(first.ok,true);
  assert.deepEqual(first.city.armorWorn.archer,[2,2,1]);
  assert.equal(first.city.armorStock.filter(v=>v===5).length,3);
  const replaced=cityAction(first.city,'equip-archer',1001,2,{level:5,replaceLevel:2});
  assert.equal(replaced.ok,true);
  assert.deepEqual(replaced.city.armorWorn.archer,[5,5,1]);
  assert.equal(replaced.city.armoredCounts.archer,3);
  assert.equal(replaced.city.armorStock.filter(v=>v===2).length,2);
  assert.equal(replaced.city.armorStock.filter(v=>v===5).length,1);
  assert.equal(cityAction(replaced.city,'equip-archer',1002,2,{level:5,replaceLevel:1}).ok,false);
  assert.equal(cityAction(replaced.city,'equip-archer',1003,1,{level:1,replaceLevel:5}).ok,false);
});

test('battle rewards finance upgrades while insufficient resources reject an action',()=>{
  const poor=makeCity({gold:0,food:0,ore:0});
  assert.equal(cityAction(poor,'cavalry',1000).ok,false);
  const reward=battleReward(poor,4,'city');
  assert.ok(reward.gold>200&&reward.ore>40);
  assert.equal(reward.city.gold,reward.gold);
});

test('winning an expedition ambush grants a separate battle reward',()=>{
  const start=makeCity({gold:0,food:0,ore:0});
  const reward=battleReward(start,2,'army');
  assert.ok(reward.gold>0&&reward.ore>0&&reward.food>0);
  assert.equal(reward.city.gold,reward.gold);
  assert.equal(reward.city.ore,reward.ore);
});

test('enemy level changes tactics and high levels include coordinated manoeuvres',()=>{
  assert.equal(enemyLevel(0,'army'),1);
  assert.equal(enemyLevel(0,'city'),2);
  assert.equal(enemyLevel(49,'city'),5);
  const easy=makeEnemyMind({level:1},()=>0);
  const hard=makeEnemyMind({level:5},()=>.4);
  const state={redLiving:70,redInitial:100,nearestDistance:400,terrain:'forest'};
  assert.ok(['charge','hold'].includes(chooseTactic(easy,state,()=>0)));
  const choices=new Set(Array.from({length:20},(_,i)=>chooseTactic(hard,state,()=>i/20)));
  assert.ok(choices.has('flank')||choices.has('pincer')||choices.has('massCharge'));
  assert.ok(choices.size>=4);
});

test('veteran commander protects threatened archers and reacts to player charge',()=>{
  const mind=makeEnemyMind({level:4},()=>.5);
  const base={redLiving:90,redInitial:100,redArchers:20,nearestDistance:390,terrain:'forest'};
  assert.equal(chooseTactic(mind,{...base,playerAttacking:true,playerCavalryCharging:true},()=>.5),'counter');
  assert.equal(chooseTactic(mind,{...base,archersExposed:true,playerCavalryNearArchers:true},()=>.5),'archerRetreat');
  const rookie=makeEnemyMind({level:1},()=>.5);
  assert.ok(['charge','hold'].includes(chooseTactic(rookie,{...base,archersExposed:true},()=>.5)));
});
test('rookie commander never chooses a veteran mass charge',()=>{
  const rookie=makeEnemyMind({level:1},()=>0);
  const state={redLiving:40,redInitial:40,redArchers:8,nearestDistance:500,terrain:'forest'};
  for(let i=0;i<20;i++)assert.ok(['charge','hold'].includes(chooseTactic(rookie,state,()=>i/20)));
});
test('large cities yield more than small cities of the same level and lost cities stop paying',()=>{
  const small={id:'small',level:3,archers:40,infantry:95,cavalry:20,towers:3};
  const large={id:'large',level:3,archers:95,infantry:190,cavalry:60,towers:6};
  assert.ok(cityRevenue(large).gold>cityRevenue(small).gold);
  assert.ok(cityRevenue(large).food>cityRevenue(small).food);
  const city=makeCity({gold:0,food:0,lastTaxes:0});
  const both=collectCityRevenue(city,[small,large],200000);
  const remaining=collectCityRevenue(city,[small],200000);
  assert.equal(both.city.gold,cityRevenue(small).gold+cityRevenue(large).gold);
  assert.equal(remaining.city.gold,cityRevenue(small).gold);
});
test('an expedition battle preserves armor worn by soldiers who stayed home',()=>{
  const city=makeCity({roster:{archer:20,infantry:20,cavalry:20},armorWorn:{archer:[2,2,2,2,2,3,3,3],infantry:[1,1],cavalry:[]}});
  const after=reconcileBattleResult(city,{archer:5,infantry:3,cavalry:0},{archer:3,infantry:2,cavalry:0},{archer:[2,2],infantry:[1],cavalry:[]});
  assert.equal(after.roster.archer,18);
  assert.deepEqual(after.armorWorn.archer,[3,3,3,2,2]);
  assert.deepEqual(after.armorWorn.infantry,[1]);
  assert.equal(after.armoredCounts.archer,5);
});
