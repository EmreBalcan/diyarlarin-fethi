export function enemyLevel(index, kind = 'army') {
  return Math.min(5, 1 + Math.floor(index / 11) + (kind === 'city' ? 1 : 0));
}

export function makeEnemyMind(encounter, random = Math.random) {
  return {
    level: encounter.level,
    nextThink: 0,
    decision: 0,
    splitDone: false,
    lastTactic: '',
    lastPlayerPressure: false,
    archetype: ['atakçı', 'savunmacı', 'kanatçı', 'karma'][Math.floor(random() * 4)],
  };
}

const byLevel = {
  1: ['charge', 'hold', 'charge'],
  2: ['charge', 'hold', 'screen', 'charge', 'flank'],
  3: ['screen', 'flank', 'focus', 'pincer', 'archerRetreat', 'counter'],
  4: ['screen', 'flank', 'focus', 'pincer', 'regroup', 'massCharge', 'counter', 'archerSplit', 'bait'],
  5: ['screen', 'flank', 'focus', 'pincer', 'regroup', 'massCharge', 'counter', 'archerSplit', 'bait', 'envelop'],
};

export function chooseTactic(mind, state, random = Math.random) {
  const level = Math.max(1, Math.min(5, mind.level));
  const pressure = Boolean(state.playerAttacking || state.blueClosing || state.nearestDistance < 240);
  const archerThreat = Boolean(state.archersExposed || state.playerCavalryNearArchers);
  const lowHealth = state.redLiving < state.redInitial * .48;
  let choice;
  if (level >= 2 && archerThreat && state.redArchers > 0) {
    choice = level >= 3 ? 'archerRetreat' : 'screen';
  } else if (level >= 2 && pressure && !mind.lastPlayerPressure) {
    choice = level >= 4 && state.playerCavalryCharging ? 'counter' : 'screen';
  } else if (level >= 3 && lowHealth && mind.lastTactic !== 'regroup') {
    choice = 'regroup';
  } else if (level >= 3 && state.terrain === 'city' && pressure && mind.lastTactic !== 'towerGuard') {
    choice = 'towerGuard';
  } else {
    const options = [...byLevel[level]];
    if (level >= 4 && state.redArchers > 8 && !mind.splitDone) options.push('archerSplit', 'archerSplit');
    if (mind.archetype === 'atakçı' && level >= 4) options.push('massCharge');
    if (mind.archetype === 'savunmacı') options.push('hold', 'screen');
    if (mind.archetype === 'kanatçı' && level >= 3) options.push('pincer', 'envelop');
    const alternatives = options.filter(option => option !== mind.lastTactic);
    const pool = alternatives.length ? alternatives : options;
    choice = pool[Math.floor(random() * pool.length)];
  }
  mind.lastPlayerPressure = pressure;
  mind.lastTactic = choice;
  mind.decision++;
  mind.nextThink = level === 1 ? 6 + random() * 2 : level === 2 ? 4.8 + random() * 1.5 : 2.6 + random() * 1.5;
  return choice;
}

export const TACTIC_LABELS = {
  charge: 'Ön hat hücumu', hold: 'Savunma hattı', screen: 'Kalkan duvarı · okçular geride',
  flank: 'Kanat saldırısı', focus: 'Zayıf birliğe odaklanma', pincer: 'Kıskaç manevrası',
  regroup: 'Yeniden mevzilenme', massCharge: 'Toplu hücum', counter: 'Karşı hücum',
  towerGuard: 'Kule gerisinde savunma', archerRetreat: 'Okçuları koru',
  archerSplit: 'Okçuları iki kola ayır', bait: 'Geri çekilip tuzağa çek', envelop: 'Çift kanat kuşatması',
};
