export function atlasCell(level,width,height){
  const index=Math.max(0,Math.min(4,Math.round(Number(level)||1)-1));
  const w=width/3,h=height/2;
  return {x:(index%3)*w,y:Math.floor(index/3)*h,w,h};
}
