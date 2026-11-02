import test from 'node:test';
import assert from 'node:assert/strict';
import {generateEncounters,TERRAIN_VARIANTS,balancedCounts,splitUnitArray,snapToGrid} from './game-logic.js';

test('fifty encounters contain cities and roaming armies with distinct battle terrain',()=>{
  const all=generateEncounters();
  assert.equal(all.length,50);
  assert.equal(new Set(all.map(e=>e.id)).size,50);
  assert.ok(all.some(e=>e.kind==='city'&&e.towers>0));
  assert.deepEqual(new Set(all.filter(e=>e.kind==='city').map(e=>e.biome)),new Set(['forest','desert','snow']));
  assert.ok(Math.max(...all.filter(e=>e.kind==='city').map(e=>e.towers))>Math.min(...all.filter(e=>e.kind==='city').map(e=>e.towers)));
  assert.deepEqual(new Set(all.map(e=>e.terrain)),new Set(['city','forest','river','mountain','desert','snow']));
  for(const terrain of ['forest','river','desert','snow']){
    const variants=new Set(all.filter(e=>e.terrain===terrain).map(e=>e.variant));
    assert.equal(variants.size,TERRAIN_VARIANTS[terrain],`${terrain} should use every background`);
  }
});
test('starting region has small level-one armies with basic equipment',()=>{
  const starters=generateEncounters().slice(0,12).filter(e=>e.kind==='army');
  assert.ok(starters.length>=6);
  for(const enemy of starters){assert.equal(enemy.level,1);assert.equal(enemy.gear.weapon,1);assert.ok(enemy.archers+enemy.infantry+enemy.cavalry<=76)}
});

test('split preserves every soldier and allows a custom 20/10 archer formation',()=>{
  const units=Array.from({length:30},(_,id)=>({id,hp:35}));
  const [right,left]=splitUnitArray(units,[20,10]);
  assert.equal(right.length,20);assert.equal(left.length,10);
  assert.equal(new Set([...right,...left].map(u=>u.id)).size,30);
  assert.deepEqual(balancedCounts(31,5),[7,6,6,6,6]);
  assert.throws(()=>splitUnitArray(units,[20,11]));
});

test('movement targets snap to accessible battlefield squares',()=>{
  const cell=snapToGrid(605,475);
  assert.ok(cell.x>=95&&cell.x<=1510&&cell.y>=115&&cell.y<=775);
  assert.deepEqual(snapToGrid(cell.x,cell.y),cell);
});
