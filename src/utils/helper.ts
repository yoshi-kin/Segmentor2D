// export const zoom = (
//   canvas: HTMLCanvasElement,
//   img: HTMLImageElement,
//   ctx:any,
//   x:number,
//   y:number
// ) => {
//   ctx.drawImage(
//     canvas,
//     Math.min(Math.max(0, x - 5), img.width - 10),
//     Math.min(Math.max(0, y - 5), img.height - 10),
//     10,
//     10,
//     0,
//     0,
//     300,
//     300,
//   );
// };

export const calcPath = (start:Point, end: Point) => {
  const path: Point[] = [];
  let diffX = end.x - start.x;
  let diffY = end.y - start.y;
  let point = start;
  let isUpdateX = true;
  // console.log("start");
  while (diffX !== 0 || diffY !== 0) {
    if (isUpdateX) {
      if (diffX > 0) {
        point = {x: point.x + 30, y: point.y}
        diffX = end.x - point.x;
        path.push(point);
      } else if (diffX < 0) {
        point = {x: point.x - 30, y: point.y}
        diffX = end.x + point.x;
        path.push(point);
      }
      isUpdateX = false;
    } else {
      if (diffY > 0) {
        point = {x: point.x, y: point.y + 30}
        diffY = end.y - point.y;
        path.push(point);
      } else if (diffY < 0) {
        point = {x: point.x, y: point.y - 30}
        diffY = end.y + point.y;
        path.push(point);
      }
      isUpdateX = true;
    }
  }
  // console.log('end');
  return path
}
export const fitVertex = (x: number, y: number, scale: number) => {
  x = x%scale >= (0.5*scale) ? x + scale - (x%scale) : x - (x%scale);
  y = y%scale >= (0.5*scale) ? y + scale - (y%scale) : y - (y%scale);
  return {x:x, y:y};
}

export const inverseScaled = (x: number, y: number, scale: number) => {
  x = Math.round(x/scale);
  y = Math.round(y/scale);
  // const invScale = 1 / scale;
  // x = x%invScale >= 0.5 ? x + 1 - (x%1) : x - (x%1);
  // y = y%invScale >= 0.5 ? y + 1 - (y%1) : y - (y%1);
  return {x:x, y:y};
}

type Point = {
  x: number;
  y: number;
};