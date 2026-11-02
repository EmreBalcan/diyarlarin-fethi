import test from 'node:test';
import assert from 'node:assert/strict';
import {BattleAudio} from './audio.js';

test('ambient loop removes edge silence and joins without a gap',()=>{
  const sampleRate=1000,data=new Float32Array(6000);
  for(let i=1000;i<5000;i++)data[i]=.4*Math.sin(i*.036)+.2;
  const source={sampleRate,numberOfChannels:1,length:data.length,getChannelData:()=>data};
  const sound=new BattleAudio();
  sound.context={createBuffer:(_,length,rate)=>{
    const output=new Float32Array(length);
    return {sampleRate:rate,numberOfChannels:1,length,getChannelData:()=>output};
  }};
  const loop=sound.makeSeamless(source),out=loop.getChannelData(0);
  assert.ok(loop.length<source.length-1200,'silent lead and tail should be removed');
  assert.ok(Math.abs(out[0]-out.at(-1))<.05,'loop seam should be continuous');
  assert.ok(out.slice(0,100).some(v=>Math.abs(v)>.08),'loop starts with audible content');
  assert.ok(out.slice(-100).some(v=>Math.abs(v)>.08),'loop ends with audible content');
});
