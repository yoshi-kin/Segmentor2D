import React from 'react'
import { imageContext, labelContext, toolContext } from './utils/context';
import Annotator from './components/Annotator';
import { Label, ImageProps, Path } from './types';
const imageList = import.meta.importGlob('/public/dataset/images/*.jpg')
const maskList = import.meta.importGlob('/public/dataset/masks/*.png')

const initImages: {[id:string]: ImageProps} = {};
for (const imageName of Object.keys(imageList)) {
  const maskName = imageName.split('/').slice(-1)[0].replace('jpg', 'png');
  const filteredMaskList = Object.keys(maskList).filter(
    (maskPath) => maskPath.split('/').slice(-1)[0] === maskName
  );
  const newId = self.crypto.randomUUID();
  initImages[newId] = {
    id: newId,
    name: imageName,
    maskName: filteredMaskList.length === 0 ? '': filteredMaskList[0],
    instances: [],
  }
}

function App() {
  const [labels, setLabels] = React.useState<Label[]>([]);
  const [selectedLabelId, setSelectedLabelId] = React.useState('');
  const [images, setImages] = React.useState<{[id: string]: ImageProps}>(initImages);
  const [path, setPath] = React.useState<Path|null>(null);
  const [mode, setMode] = React.useState('default');
  const [scale, setScale] = React.useState(1);
  const [translate, setTranslate] = React.useState({x: 0, y: 0});
  // console.log(images);

  const defualtLabelContext = {
    labels,
    selectedLabelId,
    setLabels,
    setSelectedLabelId,
  }

  const defaultImageContext = {
    images,
    path,
    setImages,
    setPath
  }

  const defaultToolContext = {
    mode,
    scale,
    translate,
    setMode,
    setScale,
    setTranslate,
  }

  return (
    <div
      style={{
        height: '100%',
        // background: "#f00"
      }}
    >
    <imageContext.Provider value={defaultImageContext}>
    <labelContext.Provider value={defualtLabelContext}>
    <toolContext.Provider value={defaultToolContext}>
      <Annotator />
    </toolContext.Provider>
    </labelContext.Provider>
    </imageContext.Provider>
    </div>
  )
}

export default App
