import test from 'node:test';
import assert from 'node:assert/strict';
import {battleReport,formatBattleDuration} from './battle-report.js';
test('report counts dead troops, keeps fleeing survivors, and combines split squads',()=>{
  const squads=[{team:'blue',type:'archer',units:[{hp:20},{hp:0}]},{team:'blue',type:'archer',fled:true,units:[{hp:8}]},{team:'red',type:'infantry',units:[{hp:0},{hp:-2},{hp:10}]}];
  const report=battleReport(squads,[{hp:0},{hp:100}],123.8,{gold:90});
  assert.equal(report.started,3);assert.equal(report.survived,2);assert.equal(report.lost,1);assert.equal(report.defeated,2);assert.equal(report.towers,1);assert.equal(report.reward.gold,90);assert.equal(formatBattleDuration(report.seconds),'2 dk 03 sn');
});
