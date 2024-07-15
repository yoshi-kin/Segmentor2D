import React from 'react';
import { inverseScaled } from '../../utils/helper';

// type Point = {
//   x: number,
//   y: number
// }

// type Path = {
//   sequence: Point[],
//   length: number,
//   isFinish: boolean,
// }

// type Instance = {
//   id: string,
//   paths: Path[],
// }

const ImageCanvas = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(new Image());
  const maskRef = React.useRef<HTMLImageElement>(null);

  // const [instances, setInstances] = React.useState<{[id:string]: Instance}>({}); 
  // const [selectedInstanceId, setSelectedInstanceId] = React.useState('');
  const [mouseDown, setMouseDown] = React.useState(false);
  const [drawing, setDrawing] = React.useState(false);
  // const [path, setPath] = React.useState<Array<{x:number, y:number}>>([]);
  const [pathLength, setPathLength] = React.useState(0);
  const pathRef = React.useRef<Array<{x:number, y:number}>>([]);
  const [scale, setScale] = React.useState(1)
  const [translate, setTranslate] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const [lastPos, setLastPos] = React.useState({ x: 0, y: 0 });
  const [mode, setMode] = React.useState<string>("default");
  const [donwloaded, setDonwloaded] = React.useState(false);
  // const [imageURL, setImageURL] = React.useState('');
  const [fileName, setFileName] = React.useState('canvas-image.png');
  const modeOptions = React.useMemo(() => [
    {value: 'default', label: 'default'},
    {value: 'edit', label: 'edit'},
  ], [])

  const wheelHandler = React.useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      setScale(prev => e.deltaY>0 ? prev * 0.5 : prev*2);
    }
  }, []);

  const mouseDownHandler = React.useCallback((e: MouseEvent) => {
    if (mode == "default") {
      setDragging(true);
      setLastPos({ x: e.clientX, y: e.clientY });
    } else if (mode == "edit") {
      if (e.shiftKey) {
        setDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
        return;
      }
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const v = {
          x: e.clientX - rect.left - translate.x,
          y: e.clientY - rect.top - translate.y
        };
        if (pathRef.current.length === 0) {
          pathRef.current.push(inverseScaled(v.x, v.y, scale));
          setPathLength(pathRef.current.length);
          setMouseDown(true);
          setDrawing(true);
        }
        else {
          const nextPos = inverseScaled(v.x, v.y, scale);
          const lastPos = pathRef.current.slice(-1)[0];
          let x = lastPos.x;
          let y = lastPos.y;
          // console.log(lastPos);
          if (nextPos.x === x && nextPos.y === y) return;
          while (nextPos.x !== x || nextPos.y !== y) {
            if (nextPos.x !== x) {
              x = (nextPos.x - x) > 0 ? x + 1 : x - 1;
              // console.log({x: lastPos.x, y: lastPos.y})
              pathRef.current.push({x: x, y: y});
            }
            if (nextPos.y !== y) {
              y = (nextPos.y - y) > 0 ? y + 1 : y - 1;
              // console.log({x: lastPos.x, y: lastPos.y})
              pathRef.current.push({x: x, y: y});
            }
          }
          if (pathRef.current[0].x === v.x && pathRef.current[0].y === v.y) {
            setPathLength(pathRef.current.length);
            setDrawing(false);
          }
          else {
            setPathLength(pathRef.current.length);
            setDrawing(true);
            setMouseDown(true);
          }
        }
      }
    }
  }, [mode, scale, translate]);

  const mouseMoveHandler = React.useCallback((e: MouseEvent) => {
    // console.log(dragging);
    if (mode == "default") {
      if (dragging) {
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastPos({ x: e.clientX, y: e.clientY });
      }
    }
    else if (mode == "edit") {
      if (dragging) {
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastPos({ x: e.clientX, y: e.clientY });
        return;
      }
      if (mouseDown && drawing) {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const rect = canvas.getBoundingClientRect();
          const v = {
            x: e.clientX - rect.left - translate.x,
            y: e.clientY - rect.top - translate.y
          };
          const nextPos = inverseScaled(v.x, v.y, scale);
          const lastPos = pathRef.current.slice(-1)[0];

          if (nextPos.x === lastPos.x && nextPos.y === lastPos.y) return;
          if (nextPos.x !== lastPos.x) {
            pathRef.current.push({x: nextPos.x, y: lastPos.y});
          }
          if (nextPos.y !== lastPos.y) {
            pathRef.current.push({x: nextPos.x, y: nextPos.y});
          }
          setPathLength(pathRef.current.length);
        }
      }
    }
  }, [dragging, lastPos, mode, mouseDown, drawing, scale, translate]);

  const mouseUpHandler = React.useCallback(() => {
    if (mode == "default") {
      setDragging(false);
    }
    else if (mode == "edit") {
      if (dragging) {
        setDragging(false);
        return;
      }
      setMouseDown(false);
    }
  }, [mode, dragging]);

  const keydownHandler = React.useCallback((e: KeyboardEvent) => {
    if (e.key === "E" || e.key === 'e') {
      console.log(e.key);
      e.preventDefault();
      const currentIndex = modeOptions.findIndex(option => option.value === mode);
      const nextIndex = (currentIndex + 1) % modeOptions.length;
      setMode(modeOptions[nextIndex].value);
    }
  }, [mode, modeOptions]);

  React.useEffect(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current!;
    // if (!canvas) return;

    // img.src = "https://interactive-examples.mdn.mozilla.net/media/examples/star.png";
    img.src = "./seves_desk.story.jpg";
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0,0, img.width, img.height);
      // console.log(img.width, img.height);
      setScale(0.5);
    }
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.addEventListener('mousedown', mouseDownHandler);
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('mouseup', mouseUpHandler);
    canvas.addEventListener('wheel', wheelHandler);
    window.addEventListener('keydown', keydownHandler);

    return () => {
      canvas.removeEventListener('mousedown', mouseDownHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
      canvas.removeEventListener('mouseup', mouseUpHandler);
      canvas.removeEventListener('wheel', wheelHandler);
      window.removeEventListener('keydown', keydownHandler);
    }
  }, [mouseDownHandler, mouseMoveHandler, mouseUpHandler, wheelHandler, keydownHandler])

  React.useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = 700;
    canvas.height = 500;
    const img = imageRef.current!;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.reset();
      // ctx.save();
      ctx.translate(translate.x, translate.y);
      // console.log(translate.x, translate.y);
      ctx.scale(scale, scale);
      ctx.lineWidth = 1 / scale;
      ctx.strokeStyle = 'rgb(255,0,0)';
      ctx.fillStyle = 'rgba(255,0,0,0.5)';
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      // ctx.restore();
      if (pathLength === 0) return;
      // console.log(pathLength, pathRef.current);
      pathRef.current.forEach((point, index) =>{
        const startPoint = pathRef.current[0];
        const lastPoint = pathRef.current.slice(-1)[0];
        if (index === 0) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
        }
        else {
          if (
            index === pathLength - 1
            && startPoint.x === lastPoint.x
            && startPoint.y === lastPoint.y
          ) {
            ctx.closePath();
            ctx.fill();
          }
          else {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
        }
      })
    }
    setDonwloaded(false);
  }, [translate, scale, pathLength, donwloaded]);

  const downloadImage = () => {
    const canvas = canvasRef.current!;
    const img = imageRef.current!;
    canvas.width = img.width;
    canvas.height = img.height;
    // console.log(canvas.width, canvas.height);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.reset();
      // ctx.save();
      // ctx.translate(translate.x, translate.y);
      // console.log(translate.x, translate.y);
      // ctx.scale(scale, scale);
      ctx.lineWidth = 1 / scale;
      ctx.strokeStyle = 'rgb(255,0,0)';
      ctx.fillStyle = 'rgb(255,0,0)';
      ctx.imageSmoothingEnabled = false;
      // ctx.restore();
      if (pathLength === 0) return;
      console.log(pathLength, pathRef.current);
      pathRef.current.forEach((point, index) =>{
        const startPoint = pathRef.current[0];
        const lastPoint = pathRef.current.slice(-1)[0];
        if (index === 0) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
        }
        else {
          if (
            index === pathLength - 1
            && startPoint.x === lastPoint.x
            && startPoint.y === lastPoint.y
          ) {
            ctx.closePath();
            ctx.fill();
          }
          else {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
        }
      })

      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = fileName;
      link.click();
      setDonwloaded(true);
    }
  }

  // const preview = () => {
  //   const mask = maskRef.current;
  //   mask.src = 
  // }

  return (
    <>
    <div>
      <select
        name="mode"
        onChange={(e) => setMode(e.target.value)}
        value={mode}
      >
        {modeOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
    <div>
      <canvas
        style={{border: '1px solid black'}}
        ref={canvasRef}
        width={700}
        height={500}
      />
    </div>
    <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)}/>
    <button onClick={downloadImage}>Download Mask Image</button>
    {/* <button onClick={preview}>Preview</button> */}
    {/* {imageURL && ( */}
      <div hidden>
        <img
          ref={maskRef}
          // src={imageURL}
          // alt="Generated"
        />
        {/* <a href={imageURL} download={fileName} >DownLoad</a> */}
      </div>
    {/* )} */}
    </>
  )
}

export default ImageCanvas