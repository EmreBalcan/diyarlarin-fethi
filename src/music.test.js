import test from 'node:test';
import assert from 'node:assert/strict';
import {MusicDirector} from './music.js';
const flush=()=>new Promise(resolve=>queueMicrotask(resolve));
function harness(){let time=0;const music=new MusicDirector({now:()=>time,schedule:()=>1,cancel:()=>{},createAudio:url=>({url,volume:0,currentTime:0,duration:60,paused:true,load(){},play(){this.paused=false;return Promise.resolve()},pause(){this.paused=true}})});return {music,step:(seconds)=>{for(let i=0;i<seconds*20;i++){time+=50;music.tick()}}}}
test('leaving a screen fades the old song instead of cutting it',async()=>{
  const {music,step}=harness();music.set('map');music.unlock();await flush();step(1.3);
  const old=music.groups.get('map').players[0];assert.ok(old.volume>.11);
  music.set('home');await flush();assert.equal(old.paused,false);assert.ok(old.volume>.11);
  step(.6);assert.ok(old.volume>0&&old.volume<.1125);assert.ok(music.groups.get('home').players[0].volume>0);
  step(.7);assert.equal(old.paused,true);assert.equal(old.volume,0);
  music.set(null);step(.5);assert.equal(music.groups.get('home').players[0].paused,false);step(.8);assert.equal(music.groups.get('home').players[0].paused,true);
});
test('loop overlaps two players and leaving during that overlap fades both',async()=>{
  const {music,step}=harness();music.set('city');music.unlock();await flush();step(1.3);
  const group=music.groups.get('city');group.players[0].currentTime=58;step(.05);await flush();step(.7);
  assert.ok(group.players.every(p=>p.volume>0));music.set('army');await flush();step(1.3);
  assert.ok(group.players.every(p=>p.paused&&p.volume===0));assert.equal(music.groups.get('army').playing,true);
});
test('muting preserves the selected scene so unmuting resumes the right track',async()=>{
  const {music,step}=harness();music.set('home');music.unlock();await flush();step(1.3);
  music.setEnabled(false);step(1.3);assert.equal(music.groups.get('home').playing,false);
  music.setEnabled(true);await flush();step(.2);assert.equal(music.groups.get('home').playing,true);
});
