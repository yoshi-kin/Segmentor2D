import React from 'react';
import { drawPaths, findColorRegions, inverseScaled, isClickOnCircle } from '../../utils/helper';
// import { datasetContext } from '../../utils/context';
import { Path, Point } from '../../types';
import { imageContext, labelContext, toolContext } from '../../utils/context';
// import { loadFromCanvas } from "potrace-wasm";
import { potrace, init } from 'esm-potrace-wasm';

const modeOptions = [
  {value: 'default', label: 'default'},
  {value: 'edit', label: 'edit'},
  {value: 'erase', label: 'erase'}
]

type Props = {
  selectedImgId: string,
  style?: React.CSSProperties,
}

const ImageCanvas = ({selectedImgId}: Props) => {
  const {labels, selectedLabelId, setSelectedLabelId} = React.useContext(labelContext);
  const {images, path, setImages, setPath} = React.useContext(imageContext);
  const {
    mode,
    scale,
    translate,
    // setMode,
    setScale,
    setTranslate
  } = React.useContext(toolContext)
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(new Image());
  const maskRef = React.useRef<HTMLImageElement>(new Image());

  const [selectedInstanceId, setSelectedInstanceId] = React.useState<string|null>(null);
  const [mouseDown, setMouseDown] = React.useState(false);
  const [drawing, setDrawing] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [lastPos, setLastPos] = React.useState({ x: 0, y: 0 });
  const [donwloaded, setDonwloaded] = React.useState(false);
  const [fileName, setFileName] = React.useState('canvas-image.png');
  const imageName = images[selectedImgId].name;
  const maskName = images[selectedImgId].maskName;
  const [zoomPos, setZoomPos] = React.useState<Point>({x:0, y:0});
  const [paths, setPaths] = React.useState<Path2D[]>([]);

  const wheelHandler = React.useCallback((e: WheelEvent) => {
    const canvas = canvasRef.current!;
    const img = imageRef.current;
    const rect = canvas.getBoundingClientRect();
    // const height = img.height;
    // const width = img.width;
    // const dx = (e.clientX - rect.x - translate.x) / (height < width ? 4*height/width : 4);
    // const dy = (e.clientY - rect.y - translate.y) / (height > width ? 4*width/height : 4);
    if (e.ctrlKey) {
      e.preventDefault();
      setScale(prev => e.deltaY>0 ? prev / 1.25 : prev * 1.25);
      if (e.deltaY < 0) {
        // setZoomPos({x: e.clientX, y: e.clientY});
        const dx_ = (e.clientX - rect.x - translate.x) / 4;
        const dy_ = (e.clientY - rect.y - translate.y) / 4;
        setTranslate(prev => ({
          x: (prev.x - dx_),
          y: (prev.y - dy_),
        }))
      }
      else {
        const dx_ = (e.clientX - rect.x - translate.x) / 5;
        const dy_ = (e.clientY - rect.y - translate.y) / 5;
        setTranslate(prev => ({
          x: (prev.x + dx_),
          y: (prev.y + dy_),
        }))
      }
      // setTranslate(prev => ({
      //   x: e.deltaY>0 ? prev.x + dx_ : prev.x - dx_,
      //   y: e.deltaY>0 ? prev.y + dy_: prev.y - dy_,
      // }))
    }
  }, [translate, setScale, setTranslate]);

  const mouseDownHandler = React.useCallback((e: MouseEvent) => {
    if (mode === "default") {
      setDragging(true);
      setLastPos({ x: e.clientX, y: e.clientY });
    }
    else if (mode === "edit" || mode === 'erase') {
      if (e.shiftKey) {
        setDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
        return;
      }
      if (!selectedLabelId) return;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const v = {
          x: e.clientX - rect.left - translate.x,
          y: e.clientY - rect.top - translate.y
        };

        if (path === null) {
          setPath({
            id: self.crypto.randomUUID(),
            sequence: [inverseScaled(v.x, v.y, scale)],
            isFinish: false,
            length: 1,
            type: mode,
            label: labels.find((label) => label.id === selectedLabelId)!
          })
          setMouseDown(true);
          setDrawing(true);
          if (selectedInstanceId === null) {
            setSelectedInstanceId(self.crypto.randomUUID())
          }
        }
        else {
          const isClick = isClickOnCircle(
            inverseScaled(v.x, v.y, scale),
            path.sequence[0],
            6/scale
          )
          const nextPos = isClick ? path.sequence[0] : inverseScaled(v.x, v.y, scale);
          const lastPos = path.sequence[path.length - 1];
          let x = lastPos.x;
          let y = lastPos.y;
          const tempPath: Point[] = [];
          // console.log(lastPos);
          // if (nextPos.x === x && nextPos.y === y) return;
          while (nextPos.x !== x || nextPos.y !== y) {
            if (nextPos.x !== x) {
              x = (nextPos.x - x) > 0 ? x + 1 : x - 1;
              tempPath.push({x: x, y: y});
            }
            if (nextPos.y !== y) {
              y = (nextPos.y - y) > 0 ? y + 1 : y - 1;
              tempPath.push({x: x, y: y});
            }
          }
          const newPath = {
            ...path,
            sequence: path.sequence.concat(tempPath),
            length: path.length + tempPath.length
          }
          setPath(newPath);
          // console.log(path.sequence[0]);
          // console.log(nextPos);
          if (
            path.sequence[0].x === nextPos.x
            && path.sequence[0].y === nextPos.y
          ) {
            if (images[selectedImgId].instances.find(
              (instance) => instance.id === selectedInstanceId
            )) {
              // setInstances((prev) => ({
              //   ...prev,
              //   [selectedInstanceId]: {
              //     ...prev[selectedInstanceId],
              //     paths: prev[selectedInstanceId].paths.concat(newPath)
              //   }
              // }))

              setImages((prev) => ({
                ...prev,
                [selectedImgId]: {
                  ...prev[selectedImgId],
                  instances: [
                    ...prev[selectedImgId].instances.map((instance) => {
                      if (instance.id === selectedInstanceId) {
                        return {
                          ...instance,
                          paths: instance.paths.concat(newPath)
                        }
                      }
                      return instance;
                    })
                  ]
                }
              }))
            }
            else {
              setImages((prev) => ({
                ...prev,
                [selectedImgId]: {
                  ...prev[selectedImgId],
                  instances: [
                    ...prev[selectedImgId].instances,
                    {
                      id: selectedInstanceId!,
                      paths: [newPath],
                      label: labels.find((label) => label.id === selectedLabelId)!,
                      selected: false,
                    }
                  ]
                }
              }))
            }
            setDrawing(false);
          }
          setMouseDown(true);
        }
      }
    }
  }, [
    mode,
    scale,
    translate,
    path,
    selectedInstanceId,
    labels,
    selectedLabelId,
    images,
    selectedImgId,
    setImages,
    setPath
  ]);

  const mouseMoveHandler = React.useCallback((e: MouseEvent) => {
    // console.log(dragging);
    if (mode === "default") {
      if (dragging) {
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastPos({ x: e.clientX, y: e.clientY });
      }
    }
    else if (mode === "edit" || mode === 'erase') {
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
          const lastPos = path!.sequence.slice(-1)[0];
          const tempPath: Point[] = [];

          if (nextPos.x === lastPos.x && nextPos.y === lastPos.y) return;
          if (nextPos.x !== lastPos.x) {
            tempPath.push({x: nextPos.x, y: lastPos.y});
          }
          if (nextPos.y !== lastPos.y) {
            tempPath.push({x: nextPos.x, y: nextPos.y});
          }
          setPath((prev) => ({
            ...prev!,
            sequence: prev!.sequence.concat(tempPath),
            length: prev!.length + tempPath.length,
          }));
        }
      }
    }
  }, [
    dragging,
    lastPos,
    mode,
    mouseDown,
    drawing,
    scale,
    translate,
    path,
    setPath,
    setTranslate
  ]);

  const mouseUpHandler = React.useCallback(() => {
    if (mode === "default") {
      setDragging(false);
    }
    else if (mode === "edit" || mode === 'erase') {
      if (dragging) {
        setDragging(false);
        return;
      }
      setMouseDown(false);
    }
  }, [mode, dragging]);

  // // define the behavior in entering `A`
  // const keydownHandler = React.useCallback((e: KeyboardEvent) => {
  //   if (e.key === "A" || e.key === 'a') {
  //     // console.log(e.key);
  //     e.preventDefault();
  //     const currentIndex = modeOptions.findIndex(option => option.value === mode);
  //     const nextIndex = (currentIndex + 1) % modeOptions.length;
  //     setSelectedLabelId('')
  //     setMode(modeOptions[nextIndex].value);
  //     setPath(null);
  //   }
  // }, [mode, modeOptions, setSelectedLabelId]);

  React.useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.addEventListener('mousedown', mouseDownHandler);
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('mouseup', mouseUpHandler);
    canvas.addEventListener('wheel', wheelHandler);
    // window.addEventListener('keydown', keydownHandler);

    return () => {
      canvas.removeEventListener('mousedown', mouseDownHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
      canvas.removeEventListener('mouseup', mouseUpHandler);
      canvas.removeEventListener('wheel', wheelHandler);
      // window.removeEventListener('keydown', keydownHandler);
    }
  }, [
    mouseDownHandler,
    mouseMoveHandler,
    mouseUpHandler,
    wheelHandler,
    // keydownHandler
  ])

  // load image
  React.useEffect(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log(canvas.width);
    console.log(canvas.height);
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    if (!ctx) return;

    img.src = imageName.replace('/public', '');
    img.onload = () => {
      ctx.reset();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0,0, img.width, img.height);
      let tmpScale = 1;
      let tmpWidth = img.width;
      let tmpHeight = img.height;

      while (tmpWidth > canvas.width || tmpHeight > canvas.height) {
        tmpWidth /= 1.25;
        tmpHeight /= 1.25;
        tmpScale /= 1.25;
      }
      setScale(tmpScale);
      setTranslate({x:0,y:0})
      setFileName(imageName.split('/').slice(-1)[0].replace('jpg', 'png'));
    }

    // // Load annotation data
    // if (maskName) {
    //   const maskCanvas = maskCanvasRef.current!;
    //   const maskImg = maskRef.current;
    //   const maskCtx = maskCanvas.getContext('2d', {willReadFrequently: true});
    //   if (!maskCtx) return;
    //   maskCtx.reset();
    //   maskImg.src = maskName.replace('/public', '');
    //   maskImg.onload = () => {
    //     maskCtx.drawImage(maskImg, 0,0, maskImg.width, maskImg.height);
    //     const imageData = maskCtx.getImageData(0, 0, maskImg.width, maskImg.height);
    //     (async () => {
    //       // Initialize the module once.
    //       await init();
    //       const svg = await potrace(
    //         imageData,
    //         ({
    //           turdsize: 2,
    //           turnpolicy: 4,
    //           alphamax: 1,
    //           opticurve: 2,
    //           opttolerance: 0.2,
    //           pathonly: false,
    //           extractcolors: true,
    //           posterizelevel: 3, // [1, 255]
    //           posterizationalgorithm: 0, // 0: simple, 1: interpolation
    //         })
    //       );
    //       const parser = new DOMParser();
    //       const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
    //       const paths = svgDoc.querySelectorAll('path');
    //       const path2D = new Path2D();
    //       paths.forEach((path) => {
    //         const d = path.getAttribute('d');
    //         if (!d) {
    //           console.log(path);
    //           return;
    //         }
    //         console.log(d)
    //         path2D.addPath(new Path2D(d));
    //       })
    //       // path2D.closePath();
    //       ctx.fillStyle = 'rgb(255,0,0,0.56)';
    //       ctx.strokeStyle = 'rgb(255,0,0)';
    //       ctx.stroke(path2D);
    //       ctx.fill(path2D);
    //     })();
    //     // const targetColor = [255, 0, 0]; // RGB values of the target color (red)
    //     // const paths = findColorRegions(
    //     //   imageData.data,
    //     //   imageData.width,
    //     //   imageData.height,
    //     //   targetColor
    //     // );
    //     // console.log('debug', paths);
    //     // drawPaths(paths, ctx);
    //   }
    // }

  }, [imageName, maskName, setScale, setTranslate]);

  // draw area
  React.useEffect(() => {
    // console.log(scale);
    const canvas = canvasRef.current!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const img = imageRef.current!;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      console.log(scale);
      ctx.reset();
      ctx.scale(scale, scale);
      ctx.translate(translate.x/scale, translate.y/scale);
      ctx.lineWidth = 5 / scale;
      ctx.imageSmoothingEnabled = false;
      // ctx.strokeStyle = "rgb(255,0,0)";
      // const annPath = new Path2D();
      // paths.map((path, idx) => {
      //   if (idx % 2 === 0) {
      //     ctx.globalCompositeOperation = 'xor';
      //     ctx.fillStyle = "rgba(255,0,0,0.5)"
      //     ctx.fill(path);
      //     ctx.stroke(path)
      //   } else {
      //     ctx.fillStyle = "rgb(255,0,0)"
      //     ctx.globalCompositeOperation = 'destination-out';
      //     ctx.fill(path);
      //     ctx.globalCompositeOperation = 'source-over';
      //     ctx.stroke(path)

      //     ctx.save();
      //     ctx.clip(annPath);
      //     ctx.stroke(annPath);
      //     ctx.restore();
      //   }
      //   annPath.addPath(path)
      //   // ctx.fill(annPath);
      //   // ctx.stroke(annPath)
      // })
      const instances = images[selectedImgId].instances;
      // console.log("instances", instances);
      instances.map((instance) => {
        const rgb = instance.label.color.rgb;
        const rgba = instance.label.color.rgba;
        instance.paths.map((path) => {
          ctx.globalCompositeOperation = path.type === 'edit' ? 'xor' : 'destination-out';
          ctx.fillStyle = path.type === 'edit' ? rgba : rgb;
          ctx.strokeStyle = rgb;
          ctx.beginPath();
          path.sequence.map((point, index) => {
            if (index === 0) {
              // // New Instance created
              // if (path.type === 'edit') {
              //   ctx.globalCompositeOperation = "source-over";
              // }
              ctx.moveTo(point.x, point.y);
            }
            else if (index === path.length - 1) {
              ctx.lineTo(point.x, point.y);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
            else {
              ctx.lineTo(point.x, point.y);
            }
          })
        })
      });
      ctx.lineWidth = 2 / scale;
      // console.log("path", path);
      if (path !== null) {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = path.label.color.rgb;
        const arcPath = new Path2D();
        const annPath = new Path2D();
        path.sequence.map((point, index) =>{
          if (index === 0) {
            if (!path.isFinish) {
              ctx.fillStyle = path.label.color.rgb;
              arcPath.arc(point.x, point.y, 8/scale, 0, 2 * Math.PI);
              // ctx.closePath();
              ctx.fill(arcPath);
            }
            // ctx.beginPath();
            // ctx.moveTo(point.x, point.y);
            annPath.moveTo(point.x, point.y)
          }
          else {
            if (
              index === path.length - 1
              && !drawing
            ) {
              // ctx.closePath();
              ctx.fill(annPath);
              setPaths(prev => ([...prev, annPath]));
              setPath(null);
              setSelectedInstanceId(null);
            }
            else {
              annPath.lineTo(point.x, point.y);
              // ctx.lineTo(point.x, point.y);
              ctx.stroke(annPath);
            }
          }
        })
      }
      ctx.globalCompositeOperation = "destination-over";
      ctx.drawImage(img, 0, 0, img.width, img.height);
    }
    setDonwloaded(false);
  }, [
    translate,
    scale,
    path,
    donwloaded,
    drawing,
    images,
    selectedImgId,
    fileName,
    setPath,
    paths
  ]);

  // const downloadImage = () => {
  //   const canvas = canvasRef.current!;
  //   const img = imageRef.current!;
  //   canvas.width = img.width;
  //   canvas.height = img.height;
  //   console.log(canvas.width, canvas.height);
  //   const ctx = canvas.getContext('2d');
  //   if (ctx) {
  //     ctx.reset();
  //     // ctx.lineWidth = 1 / scale;
  //     ctx.imageSmoothingEnabled = false;
  //     const instances = images[selectedImgId].instances;
  //     instances.map((instance) => {
  //       const rgb = instance.label.color.rgb;
  //       const rgba = instance.label.color.rgba;
  //       instance.paths.map((path) => {
  //         ctx.globalCompositeOperation = path.type === 'edit' ? 'xor' : 'destination-out';
  //         ctx.fillStyle = path.type === 'edit' ? rgba : rgb;
  //         // console.log(path.type);
  //         path.sequence.map((point, index) => {
  //           if (index === 0) {
  //             ctx.beginPath();
  //             ctx.moveTo(point.x, point.y);
  //           }
  //           else if (index === path.length - 1) {
  //             ctx.lineTo(point.x, point.y);
  //             ctx.closePath();
  //             ctx.fill();
  //           }
  //           else {
  //             ctx.lineTo(point.x, point.y);
  //           }
  //         })
  //       })
  //     });

  //     const dataURL = canvas.toDataURL('image/png');
  //     const link = document.createElement('a');
  //     link.href = dataURL;
  //     link.download = fileName;
  //     link.click();
  //     setDonwloaded(true);
  //   }
  // }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        // background: "#55f",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* <div style={{display: 'flex', justifyContent: 'end'}}>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <button onClick={downloadImage}>Download</button>
      </div> */}
      <div style={{
        display: "flex",
        flex: 1,
      }}>
        <canvas
          style={{
            // border: '1px solid #111',
            background: "#aab",
            width: "100%",
            height: "100%",
            cursor: mode === "default" ? 'grab' : mode === 'edit' ? 'default' : 'crosshair'
          }}
          className='cursor'
          ref={canvasRef}
        />
      </div>
      <div hidden>
        <canvas ref={maskCanvasRef}/>
      </div>
    </div>
  )
}

export default ImageCanvas