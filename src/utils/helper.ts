type Point = {
  x: number;
  y: number;
}

export const inverseScaled = (x: number, y: number, scale: number) => {
  x = Math.round(x/scale);
  y = Math.round(y/scale);
  return {x:x, y:y};
}

export const isClickOnCircle = (click: Point, circleCenter: Point, radius: number) => {
  const distance = Math.sqrt(
    Math.pow(circleCenter.x - click.x, 2) + Math.pow(circleCenter.y - click.y, 2)
  )
  return (distance <= radius)
}

export const hexToRgb = (hex: string) => {
  // '#' を除去する
  hex = hex.replace(/^#/, '');

  // 3桁の16進数を6桁に変換する（例: #fff -> #ffffff）
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // 16進数を10進数に変換する
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgb(${r},${g},${b})`;
}

export const hexToRgba = (hex: string) => {
  // '#' を除去する
  hex = hex.replace(/^#/, '');

  // 3桁の16進数を6桁に変換する（例: #fff -> #ffffff）
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // 16進数を10進数に変換する
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r},${g},${b},0.5)`;
}

export const rgbToHex = (rgb: string) => {
  // RGB文字列を分割し、各値を取り出す
  const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);

  // RGB値を16進数に変換する
  if (result) {
    const r = parseInt(result[1], 10);
    const g = parseInt(result[2], 10);
    const b = parseInt(result[3], 10);

    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // 無効なRGB文字列の場合はnullを返す
  return null;
}

export const findColorRegions = (
  data,
  width: number,
  height: number,
  targetColor: number[]
) => {
  const visited = new Array(width * height).fill(false);
  console.log(visited.length);
  const paths = [];

  function matchesColor(r: number, g: number, b: number) {
    return r === targetColor[0]
            && g === targetColor[1]
            && b === targetColor[2];
  }

  function getPixelIndex(x: number, y: number) {
    return (y * width + x) * 4;
  }

  function mooreNeighborTracing(sx, sy) {
    const boundary = [];
    let cx = sx;
    let cy = sy;
    let prevDir = 0;
    const directions = [
      [-1, 0], [0, -1],
      [1, 0], [0, 1]
    ];

    do {
      boundary.push([cx, cy]);
      visited[cy * width + cx] = true;

      let foundNext = false;
      for (let i = 0; i < directions.length; i++) {
        const dir = (prevDir + 1 + i) % directions.length;
        const [dx, dy] = directions[dir];
        const nx = cx + dx;
        const ny = cy + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const index = getPixelIndex(nx, ny);
          if (matchesColor(data[index], data[index + 1], data[index + 2])) {
            // console.log(cx, cy);
            cx = nx;
            cy = ny;
            prevDir = (dir + 2) % directions.length;
            foundNext = true;
            break;
          }
        }
      }

      if (!foundNext) break;
    } while (cx !== sx || cy !== sy);

    return boundary;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visited[y * width + x]) continue;

      const index = getPixelIndex(x, y);
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      if (matchesColor(r, g, b)) {
        // console.log(x, y);
        const boundary = mooreNeighborTracing(x, y);
        if (boundary.length > 0) {
          paths.push(boundary);
          console.log('debug push path')
        }
      }
    }
  }

  return paths;
}

export const drawPaths = (paths, ctx) => {
  paths.forEach(path => {
    ctx.fillStyle = 'rgba(255,0,0,0.5)';
    ctx.strokeStyle = 'rgba(255,0,0,0.5)';
    ctx.beginPath();
    path.forEach(([x, y], index) => {
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.stroke();
    // ctx.fill()
  });
}