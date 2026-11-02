import test from 'node:test';
import assert from 'node:assert/strict';
import {HARVEST_DELAY_MS,HARVEST_REMINDER_MS,harvestNotificationPlan} from './harvest-notification.js';

test('harvest notification is scheduled exactly one hour later',()=>{
  assert.equal(HARVEST_DELAY_MS,3_600_000);
});

test('collectible harvest keeps reminding every two hours',()=>{
  assert.equal(HARVEST_REMINDER_MS,7_200_000);
  assert.deepEqual(harvestNotificationPlan(1_000,1_000),{readyAt:3_601_000,readyDelay:3_600_000,reminderAt:7_201_000});
});

test('already ready harvest skips a duplicate ready transition alert',()=>{
  assert.deepEqual(harvestNotificationPlan(1_000,7_201_000),{readyAt:7_201_000,readyDelay:0,reminderAt:14_401_000});
});
