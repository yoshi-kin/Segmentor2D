import React from 'react'
import { Box, Keypoints, KeypointsDefinition, Point, Polygon, Region } from './region-tools'
import {useRafState} from 'react-use';
import useWindowSize from '../../hooks/use-window-size';
import useExcludePattern from '../../hooks/use-exclude-pattern';
import { fitVertex, zoom } from '../../utils/helper';

// const getDefaultMat = (allowedArea=null, {iw, ih}={}) => {
//   let mat = Matrix.from(1,0,0,1,-10,-10);

// }

type Props = {
  // regions: Array<Region>,
  // imageSrc?: string,
  // videoSrc?: string,
  // videoTime?: number,
  // keypointsDefnition?: KeypointsDefinition,
  // onMouseMove?: (x: number, y: number) => void,
  // onMouseDown?: (x: number, y: number) => void,
  // onMouseUp?: (x: number, y: number) => void,
  // dragWithPrimary?: boolean,
  // zoomWithPrimary?: boolean,
  // createWithPrimary?: boolean,
  // showTags?: boolean,
  // realSize?: {width: number, height: number; unitName: string},
  // showCrosshairs?: boolean,
  // showMask?: boolean,
  // showHighlightBox?: boolean,
  // showPointDistances?: boolean,
  // pointDistancePrecision?: number,
  // regionClsList?: Array<string>,
  // regionTagList?: Array<string>,
  // allowedArea?: {x: number, y: number, w: number, h: number},
  // RegionEditLabel?: Node,
  // videoPlaying?: boolean,
  // zoomOnAllowedArea?: boolean,
  // fullImageSegmentationMode?: boolean,
  // autoSegmentationOptions?: {},
  // modifyingAllowedArea?: boolean,
  // allowComments?: boolean,
  // onChangeRegion: (region: Region) => void,
  // onBeginRegionEdit: (region: Region) => void,
  // onCloseRegionEdit: (region: Region) => void,
  // onDeleteRegion: (region: Region) => void,
  // onBeginBoxTransform: (box: Box, region: Region) => void,
  // onBeginMovePolygonPoint: (polygon: Polygon, region: Region) => void,
  // onBeginMoveKeypoint: (keypoints: Keypoints, index: number) => void,
  // onAddPolygonPoint: (polygon: Polygon, index: number) => void,
  // onSelectRegion: (region: Region) => void,
  // onBeginMovePoint: (point: Point) => void,
  // onImageOrVideoLoaded: (
  //   naturalWidth: number,
  //   naturalHeight: number,
  //   duration?: number,
  // ) => void,
  // onChangeVideoTime: (time: number) => void,
  // onRegionClassAdded: () => void,
  // onChangeVideoPlaying?: () => void,
}

const ImageCanvas = ({
  // regions,
  // imageSrc,
  // videoSrc,
  // videoTime,
  // keypointsDefnition,
  // onMouseMove,
  // onMouseDown,
  // onMouseUp,
  // dragWithPrimary,
  // zoomWithPrimary,
  // createWithPrimary,
  // showTags,
  // realSize,
  // showCrosshairs,
  // showMask,
  // showHighlightBox,
  // showPointDistances,
  // pointDistancePrecision,
  // regionClsList,
  // regionTagList,
  // allowedArea,
  // RegionEditLabel,
  // videoPlaying,
  // zoomOnAllowedArea,
  // fullImageSegmentationMode,
  // autoSegmentationOptions,
  // modifyingAllowedArea,
  // allowComments,
  // onChangeRegion,
  // onBeginRegionEdit,
  // onCloseRegionEdit,
  // onDeleteRegion,
  // onBeginBoxTransform,
  // onBeginMovePolygonPoint,
  // onBeginMoveKeypoint,
  // onAddPolygonPoint,
  // onSelectRegion,
  // onBeginMovePoint,
  // onImageOrVideoLoaded,
  // onChangeVideoTime,
  // onRegionClassAdded,
  // onChangeVideoPlaying,
}: Props) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const imageRef = React.useRef<HTMLImageElement>(new Image());
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [path, setPath] = React.useState<Array<[number, number]>>([]);
  // const [isMouseMove, setIsMouseMove] = React.useState(false);
  // const [isMouseUp, setIsMouseUp] = React.useState(false);
  // const layoutParams = React.useRef<{iw:number, ih:number, fitScale:number, canvasWidth:number, canvasHeight:number}>({
  //   iw: 0,
  //   ih: 0,
  //   fitScale: 0,
  //   canvasWidth: 0,
  //   canvasHeight: 0
  // });
  // const [dragging, changeDragging] = useRafState(false);
  // const [maskImagesLoaded, changeMaksImagesLoaded] = useRafState(0);
  // const [zoomStart, changeZoomStart] = useRafState(null);
  // const [zoomEnd, changeZoomEnd] = useRafState(null);
  // const maskImages = React.useRef({});
  // const windowSize = useWindowSize();
  // const [imageDimensions, changeImageDimensions] = React.useState({naturalWidth: 0, naturalHeight: 0});
  // const imageLoaded = Boolean(imageDimensions && imageDimensions.naturalWidth);

  // const {mouseEvents, mousePosition} = useMouse({
  //   canvasEl,
  //   dragging,

  // })

  // const excludePattern = useExcludePattern();
  // const canvas = canvasEl.current;
  // if (canvas && imageLoaded) {
  //   const {clientWidth, clientHeight} = canvas;
  //   const fitScale = Math.max(
  //     imageDimensions.naturalWidth / (clientWidth - 20),
  //     imageDimensions.naturalHeight / (clientHeight - 29)
  //   )

  //   const [iw, ih] = [
  //     imageDimensions.naturalWidth / fitScale,
  //     imageDimensions.naturalHeight / fitScale
  //   ]

  //   layoutParams.current = {
  //     iw,
  //     ih,
  //     fitScale,
  //     canvasWidth: clientWidth,
  //     canvasHeight: clientHeight
  //   }
  // }
  
  // React.useEffect(() => {
  //   if (!imageLoaded) return;

  // }, [imageLoaded]);

  // React.useLayoutEffect(() => {
  //   if (!imageDimensions || !canvas) return;
  //   const {clientWidth, clientHeight} = canvas;
  //   canvas.width = clientWidth;
  //   canvas.height = clientHeight;
  //   const context = canvas.getContext('2d');
  //   if (context) {
  //     context?.save();
  //     // context.transform()
  //     const {iw, ih} = layoutParams.current;
  
  //     if (allowedArea) {
  //       const {x, y, w, h} = allowedArea;
  //       context.save();
  //       context.globalAlpha = 1;
  //       const outer = [
  //         [0,0],
  //         [iw,0],
  //         [iw,ih],
  //         [0,ih],
  //       ]
  
  //       const inner = [
  //         [x*iw, y*ih],
  //         [2*x*iw, y*ih],
  //         [2*x*iw, 2*y*ih],
  //         [x*iw, 2*y*ih]
  //       ]
  //       context.moveTo(...outer[0]);
  //     }
  //   }

  // })
}