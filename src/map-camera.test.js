import test from 'node:test';
import assert from 'node:assert/strict';
import {clampMapCamera} from './map-camera.js';
test('map covers viewport at every drag boundary and zoom on mobile aspect ratios',()=>{
 for(const [vw,vh] of [[1600,900],[1600,720],[1500,900]])for(const zoom of [1,1.06,1.8,2.4])for(const x of [-9999,9999])for(const y of [-9999,9999]){
  const c=clampMapCamera({x,y,zoom},1600,900,vw,vh);
  assert.ok(1600/2+c.x-1600*c.zoom/2<=(1600-vw)/2+1e-8);
  assert.ok(1600/2+c.x+1600*c.zoom/2>=(1600+vw)/2-1e-8);
  assert.ok(900/2+c.y-900*c.zoom/2<=(900-vh)/2+1e-8);
  assert.ok(900/2+c.y+900*c.zoom/2>=(900+vh)/2-1e-8);
 }
});
