// Keep the scaled map covering the visible canvas, including wide mobile screens.
export function clampMapCamera(camera,width,height,visibleWidth=width,visibleHeight=height){
  const zoom=Math.max(1,camera.zoom);
  const limitX=Math.max(0,(width*zoom-visibleWidth)/2);
  const limitY=Math.max(0,(height*zoom-visibleHeight)/2);
  return {zoom,x:Math.max(-limitX,Math.min(limitX,camera.x)),y:Math.max(-limitY,Math.min(limitY,camera.y))};
}
