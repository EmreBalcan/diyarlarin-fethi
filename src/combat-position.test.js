import test from 'node:test';
import assert from 'node:assert/strict';
import {positionModifier} from './combat-position.js';
import {makeCity} from './city-logic.js';

const squad=(team,type,x,y,mode='attack')=>({team,type,x,y,mode,units:[{hp:100}]});

test('release keeps saved resources but removes unlimited test mode',()=>{
  const start=makeCity();
  assert.deepEqual(start.roster,{archer:30,infantry:30,cavalry:30});
  assert.deepEqual(start.armorStock,Array(10).fill(2));
  assert.deepEqual([start.gold,start.food,start.ore],[300,500,500]);
  const tester=makeCity({testMode:true,gold:99999,food:99999,ore:99999});
  assert.equal(tester.testMode,false);
  assert.equal(tester.gold,99999);
});

test('infantry screen materially protects archers from cavalry',()=>{
  const horse=squad('red','cavalry',520,420);
  const archer=squad('blue','archer',350,420);
  const screen=squad('blue','infantry',430,420,'defend');
  const exposed=positionModifier(horse,archer,[horse,archer]).multiplier;
  const covered=positionModifier(horse,archer,[horse,archer,screen]).multiplier;
  assert.ok(covered<exposed*.5);
});
test('repositioned archer gains attack and protection when placed behind infantry',()=>{
  const horse=squad('red','cavalry',520,420);
  const screen=squad('blue','infantry',430,420,'defend');
  const exposed=squad('blue','archer',475,420);
  const sheltered=squad('blue','archer',350,420);
  const before=positionModifier(exposed,horse,[horse,exposed,screen]);
  const after=positionModifier(sheltered,horse,[horse,sheltered,screen]);
  assert.ok(after.multiplier>before.multiplier);
  assert.ok(positionModifier(horse,sheltered,[horse,sheltered,screen]).multiplier<positionModifier(horse,exposed,[horse,exposed,screen]).multiplier);
});

test('cavalry flank beats frontal charge into defensive infantry',()=>{
  const foot=squad('blue','infantry',420,440,'defend');
  const frontal=squad('red','cavalry',530,440);
  const flank=squad('red','cavalry',460,280);
  assert.ok(positionModifier(flank,foot,[flank,foot]).multiplier>positionModifier(frontal,foot,[frontal,foot]).multiplier*1.8);
});
