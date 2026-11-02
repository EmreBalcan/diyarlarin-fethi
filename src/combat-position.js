// All coordinates and supporting squads are sampled when a strike lands, so
// repositioning in battle changes the result immediately.
export function positionModifier(attacker, defender, squads, terrain = 'forest') {
  const allies = squads.filter(s => s.team === defender.team && s !== defender && s.units?.some(u => u.hp > 0) && !s.fled);
  const distance = Math.hypot(attacker.x - defender.x, attacker.y - defender.y);
  let multiplier = 1;
  const notes = [];
  const screens = allies.filter(s => s.type === 'infantry' && Math.hypot(s.x - defender.x, s.y - defender.y) < 220);
  const screenBetween = screens.some(s => {
    const dx=attacker.x-defender.x,dy=attacker.y-defender.y;
    const t=((s.x-defender.x)*dx+(s.y-defender.y)*dy)/(distance*distance||1);
    return t>.08&&t<.92&&Math.hypot(s.x-(defender.x+t*dx),s.y-(defender.y+t*dy))<105;
  });
  if (defender.type === 'archer' && screenBetween) {
    multiplier *= attacker.type === 'cavalry' ? .48 : .72;
    notes.push('piyade hattı okçuyu koruyor');
  }
  if (attacker.type === 'cavalry' && defender.type === 'archer' && !screenBetween) {
    multiplier *= 1.38;
    notes.push('açıkta kalan okçuya süvari hücumu');
  }
  if (attacker.type === 'cavalry' && defender.type === 'infantry') {
    const infantrySupport = allies.filter(s => s.type === 'infantry' && Math.hypot(s.x - defender.x, s.y - defender.y) < 155).length;
    const frontal = Math.abs(attacker.y - defender.y) < 90;
    multiplier *= frontal && (defender.mode === 'defend' || infantrySupport) ? .65 : 1.27;
    notes.push(frontal && (defender.mode === 'defend' || infantrySupport) ? 'savunmadaki piyade hattı süvariyi durduruyor' : 'süvari kanattan piyadeyi vuruyor');
  }
  if (attacker.type === 'archer') {
    const friendlyScreen=squads.some(s=>s.team===attacker.team&&s!==attacker&&s.type==='infantry'&&s.units?.some(u=>u.hp>0)&&!s.fled&&Math.hypot(s.x-attacker.x,s.y-attacker.y)<230&&Math.hypot(s.x-defender.x,s.y-defender.y)<distance);
    if(friendlyScreen&&distance>=115){multiplier*=1.15;notes.push('piyade arkasından güvenli atış')}
    if (attacker.y < defender.y - 105) { multiplier *= 1.2; notes.push('yüksek/arka mevziden atış'); }
    if (distance < 100) { multiplier *= .65; notes.push('yakın dövüşte okçu zorlanıyor'); }
  }
  if (terrain === 'river' && Math.abs(attacker.y - defender.y) > 130 && attacker.type === 'archer') {
    multiplier *= 1.09;
    notes.push('nehir geçidini kontrol ediyor');
  }
  return { multiplier: Math.max(.4, Math.min(1.7, multiplier)), notes };
}
