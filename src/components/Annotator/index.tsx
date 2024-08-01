import React from 'react'
import { imageContext, labelContext, toolContext } from '../../utils/context'
import ImageCanvas from '../ImageCanvas';
import LabelWidget from '../LabelWidget';
import ToolWidget from '../ToolWidget';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import { FaBeer } from 'react-icons/fa';

const Annotator = () => {
  // const {imageNames, maskNames} = React.useContext(datasetContext);
  const {images} = React.useContext(imageContext);
  const {setMode} = React.useContext(toolContext);
  const {setSelectedLabelId} = React.useContext(labelContext);
  const imageIds = Object.keys(images);
  const [selectedImgId, setSelectedImgId] = React.useState(imageIds[0]);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(new Image());

  const nextHandler = () => {
    const imgIdx:number = imageIds.findIndex((imageId) => imageId === selectedImgId);
    if (imgIdx === -1 || imgIdx === imageIds.length - 1) return;
    const nextId = imageIds[imgIdx+1];
    setSelectedImgId(nextId);
    setMode('default');
    setSelectedLabelId('');
  }

  const backHandler = () => {
    const imgIdx:number = imageIds.findIndex((imageId) => imageId === selectedImgId);
    if (imgIdx === -1 || imgIdx === 0) return;
    const lastId = imageIds[imgIdx-1];
    setSelectedImgId(lastId);
    setMode('default');
    setSelectedLabelId('');
  }

  const downloadHandler = () => {
    const canvas = canvasRef.current!;
    const img = imageRef.current!;
    img.src = images[selectedImgId].maskName;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      console.log(canvas.width, canvas.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.reset();
        // ctx.lineWidth = 1 / scale;
        ctx.imageSmoothingEnabled = false;
        const instances = images[selectedImgId].instances;
        instances.map((instance) => {
          const rgb = instance.label.color.rgb;
          const rgba = instance.label.color.rgba;
          instance.paths.map((path) => {
            ctx.globalCompositeOperation = path.type === 'edit' ? 'xor' : 'destination-out';
            ctx.fillStyle = path.type === 'edit' ? rgba : rgb;
            // console.log(path.type);
            path.sequence.map((point, index) => {
              if (index === 0) {
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
              }
              else if (index === path.length - 1) {
                ctx.lineTo(point.x, point.y);
                ctx.closePath();
                ctx.fill();
              }
              else {
                ctx.lineTo(point.x, point.y);
              }
            })
          })
      });

        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = images[selectedImgId].maskName.replace('/public/dataset/masks/', '');
        link.click();
      }
      // setDonwloaded(true);
    }
  }

  return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          height: "100%",
          // background: "#0f0"
        }}
      >
        <div style={{width: "200px", background: '#eee'}}>
          <LabelWidget/>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: "100%",

            // background: "#00f"
          }}
        >
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <div>
            <button onClick={backHandler}><FaChevronLeft /></button>
            <button onClick={nextHandler}><FaChevronRight /></button>
            <ToolWidget />
            </div>
            <button style={{justifyContent: 'end'}} onClick={downloadHandler}>Download</button>
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              // background: "#ff0"
            }}
          >
            <ImageCanvas selectedImgId={selectedImgId}/>
            <canvas ref={canvasRef} hidden/>
          </div>
        </div>
      </div>
  )
}

export default Annotator