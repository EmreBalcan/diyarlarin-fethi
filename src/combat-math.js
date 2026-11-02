export const DEFAULT_GEAR={stars:1,weapon:1,armor:0,arrows:1,shield:0};
export const UNIT_ATTACK={archer:29,infantry:34,cavalry:64};
export const UNIT_HEALTH={archer:52,infantry:135,cavalry:115};
export function armorHitCapacity(level){const n=Math.max(0,Math.min(5,Number(level)||0));return n?3*n+1:0}
export function applyArmorHit(unit,rawDamage){
  const armored=unit.armorHits>0&&unit.armorLevel>0;
  const divisor=armored?1+.24*unit.armorLevel:1;
  const hpDamage=Math.min(unit.hp,rawDamage/divisor);
  unit.hp=Math.max(0,unit.hp-hpDamage);
  if(armored){unit.armorHits--;if(unit.armorHits===0)unit.armorLevel=0}
  return {usedRaw:hpDamage*divisor,hpDamage,broke:armored&&unit.armorHits===0};
}
export function unitHealth(type,gear=DEFAULT_GEAR){return Math.round(UNIT_HEALTH[type]*(1+.18*(gear.stars-1)))}
export function baseStrikeDamage(attackerType,attackerGear,count=1){
  const attack=UNIT_ATTACK[attackerType];
  const skill=1+.35*(attackerGear.stars-1);
  const weapon=1+.16*(attackerGear.weapon-1);
  const arrows=attackerType==='archer'?1+.10*((attackerGear.arrows||1)-1):1;
  return attack*skill*weapon*arrows*Math.sqrt(Math.max(1,count));
}
export function strikeDamage(attackerType,attackerGear,defenderType,defenderGear=DEFAULT_GEAR,count=1){
  const armor=1/(1+.24*(defenderGear.armor||0));
  const shield=1/(1+.08*(defenderGear.shield||0));
  return baseStrikeDamage(attackerType,attackerGear,count)*armor*shield;
}
