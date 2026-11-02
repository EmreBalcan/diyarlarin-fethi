import test from 'node:test';
import assert from 'node:assert/strict';
import {generateEncounters} from './game-logic.js';
import {makeBattleScene,isWalkable,nearestWalkable,advanceOnScene,surfaceAt,riverY} from './battle-scene.js';

test('every target has a distinct physical scene and every castle has its own appearance index',()=>{
  const encounters=generateEncounters();
  const scenes=encounters.map(makeBattleScene);
  assert.equal(new Set(scenes.map(s=>JSON.stringify([s.seed,s.biome,s.variant,s.obstacles,s.wind,s.landmark]))).size,50);
  for(const biome of ['snow','forest','desert']){
    const cities=encounters.filter(e=>e.kind==='city'&&e.biome===biome);
    assert.equal(new Set(cities.map(e=>e.cityVariant)).size,cities.length);
  }
  const mountain=encounters.find(e=>e.name==='Dağ Muhafızları');
  assert.equal(mountain.terrain,'mountain');
  assert.equal(makeBattleScene(mountain).water,false);
});

test('units can cross shallow water without hitting invented vector obstacles',()=>{
  const encounters=generateEncounters();
  const river=makeBattleScene(encounters.find(e=>e.terrain==='river'));
  assert.equal(surfaceAt(river,800,riverY(river,800)),'water');
  const rocky=makeBattleScene(encounters.find(e=>e.terrain==='mountain'));
  const first=rocky.obstacles[0];
  assert.equal(isWalkable(rocky,first.x,first.y),true);
  const clear=nearestWalkable(rocky,first.x,first.y);
  assert.equal(isWalkable(rocky,clear.x,clear.y),true);
  const moved=advanceOnScene(rocky,clear,{x:800,y:500},10);
  assert.equal(isWalkable(rocky,moved.x,moved.y),true);
});
