import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCity,CITY_KEY} from './city-logic.js';
import {exportSave,importSave} from './save-backup.js';
function storage(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)}}
test('campaign backup transfers progress without restoring test mode',()=>{
 const old=storage(),next=storage();old.setItem(CITY_KEY,JSON.stringify({...makeCity(),gold:876,testMode:true}));old.setItem('orman-savaslari-victories','["hedef-1"]');importSave(exportSave(old),next);assert.equal(JSON.parse(next.getItem(CITY_KEY)).gold,876);assert.equal(JSON.parse(next.getItem(CITY_KEY)).testMode,false);assert.equal(next.getItem('orman-savaslari-victories'),'["hedef-1"]');
});
test('invalid backup cannot overwrite an existing campaign',()=>{
 const saved=storage();saved.setItem(CITY_KEY,JSON.stringify(makeCity()));const before=saved.getItem(CITY_KEY);assert.throws(()=>importSave('{"game":"other"}',saved));assert.equal(saved.getItem(CITY_KEY),before);
});
