import test from 'node:test';
import assert from 'node:assert/strict';
import {RESOURCE_SITES,totalTroops,expeditionCost,travelLosses,gatheringReward,ambushEncounter,applyTravelLosses,visibleWorkerCount} from './expedition-logic.js';

test('18 distinct reusable sites include three riskier gold fields',()=>{
  assert.equal(RESOURCE_SITES.length,18);
  assert.equal(new Set(RESOURCE_SITES.map(s=>s.id)).size,18);
  assert.deepEqual(new Set(RESOURCE_SITES.map(s=>s.terrain)),new Set(['snow','forest','desert']));
  for(const site of RESOURCE_SITES){assert.ok(site.risk>0&&site.risk<1);assert.ok(['farm','mine','depot','gold'].includes(site.kind))}
  assert.equal(RESOURCE_SITES.filter(s=>s.kind==='gold').length,3);
  assert.ok(Math.min(...RESOURCE_SITES.filter(s=>s.kind==='gold').map(s=>s.risk))>Math.min(...RESOURCE_SITES.filter(s=>s.kind==='farm').map(s=>s.risk)));
});
test('food cost grows with dispatched soldiers, but ambush risk stays tied to site',()=>{
  const site=RESOURCE_SITES[0],small={archer:2,infantry:3,cavalry:0},large={archer:20,infantry:30,cavalry:8};
  assert.ok(expeditionCost(site,large)>expeditionCost(site,small));
  assert.equal(site.risk,RESOURCE_SITES[0].risk);
  assert.ok(totalTroops(large)>totalTroops(small));
});
test('travel losses remain bounded and resources follow the site type',()=>{
  const roster={archer:4,infantry:5,cavalry:3};
  assert.deepEqual(travelLosses(roster,()=>1),{archer:0,infantry:0,cavalry:0});
  assert.deepEqual(travelLosses(roster,()=>0),roster);
  assert.ok(gatheringReward(RESOURCE_SITES.find(s=>s.kind==='farm'),roster).food>0);
  assert.ok(gatheringReward(RESOURCE_SITES.find(s=>s.kind==='mine'),roster).ore>0);
  assert.ok(gatheringReward(RESOURCE_SITES.find(s=>s.kind==='depot'),roster).gold>0);
  assert.ok(gatheringReward(RESOURCE_SITES.find(s=>s.kind==='gold'),roster).gold>gatheringReward(RESOURCE_SITES.find(s=>s.kind==='mine'),roster).ore);
  assert.equal(ambushEncounter(RESOURCE_SITES[0]).towers,0);
});
test('travel losses reduce the city roster and gathering workers follow survivors',()=>{
  const city={roster:{archer:14,infantry:12,cavalry:8},armoredCounts:{archer:6,infantry:4,cavalry:2}};
  const sent={archer:10,infantry:8,cavalry:5},lost={archer:2,infantry:1,cavalry:1};
  const result=applyTravelLosses(city,sent,lost);
  assert.deepEqual(result.city.roster,{archer:12,infantry:11,cavalry:7});
  assert.deepEqual(result.survivors,{archer:8,infantry:7,cavalry:4});
  assert.equal(visibleWorkerCount(result.survivors),19);
  assert.deepEqual(city.roster,{archer:14,infantry:12,cavalry:8});
});
test('travel losses never leave more worn armor than surviving soldiers',()=>{
  const city={roster:{archer:5,infantry:0,cavalry:0},armoredCounts:{archer:5,infantry:0,cavalry:0},armorWorn:{archer:[1,2,3,4,5],infantry:[],cavalry:[]}};
  const result=applyTravelLosses(city,{archer:5,infantry:0,cavalry:0},{archer:2,infantry:0,cavalry:0});
  assert.equal(result.city.roster.archer,3);
  assert.deepEqual(result.city.armorWorn.archer,[1,2,3]);
  assert.equal(result.city.armoredCounts.archer,3);
});
