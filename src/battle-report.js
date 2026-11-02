const TYPES=['archer','infantry','cavalry'];
export function battleReport(squads,towers,seconds,reward={}){
  const rows=TYPES.map(type=>{
    const friendly=squads.filter(s=>s.team==='blue'&&s.type===type).flatMap(s=>s.units);
    const enemy=squads.filter(s=>s.team==='red'&&s.type===type).flatMap(s=>s.units);
    const survived=friendly.filter(u=>u.hp>0).length;
    return {type,started:friendly.length,survived,lost:friendly.length-survived,defeated:enemy.filter(u=>u.hp<=0).length};
  });
  return {rows,seconds:Math.max(0,Math.floor(seconds)),started:rows.reduce((n,r)=>n+r.started,0),survived:rows.reduce((n,r)=>n+r.survived,0),lost:rows.reduce((n,r)=>n+r.lost,0),defeated:rows.reduce((n,r)=>n+r.defeated,0),towers:towers.filter(t=>t.hp<=0).length,reward:{gold:reward.gold||0,food:reward.food||0,ore:reward.ore||0,armor:reward.armor||0}};
}
export function formatBattleDuration(seconds){return `${Math.floor(seconds/60)} dk ${Math.floor(seconds%60).toString().padStart(2,'0')} sn`}
