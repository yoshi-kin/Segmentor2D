import React from 'react'
import { imageContext, toolContext } from '../../utils/context'
import { FaSearchPlus, FaSearchMinus, FaArrowUp, FaArrowDown, FaArrowRight, FaArrowLeft, FaPen, FaEraser } from "react-icons/fa";

// const modeOptions = [
//   {value: 'default', label: 'default'},
//   {value: 'edit', label: 'edit'},
//   {value: 'erase', label: 'erase'}
// ]
type Props = {
  size: number,
  style: React.CSSProperties,
}

const ToolWidget = ({size, style}: Props) => {
  const {
    mode,
    scale,
    translate,
    setMode,
    setScale,
    setTranslate
  } = React.useContext(toolContext);
  const {setPath} = React.useContext(imageContext);

  const scaleHandler = (direction: "up"|"down") => {
    if (direction === 'up') {
      setScale(prev => prev * 2)
    }
    else if (direction === 'down') {
      setScale(prev => prev / 2)
    }
  }

  const translateHandler = (direction: 'up'|'down'|'left'|'right', d:number=100) => {
    if (direction === 'up') {
      setTranslate(prev => ({x: prev.x, y: prev.y-d}))
    }
    else if (direction === 'down') {
      setTranslate(prev => ({x: prev.x, y: prev.y+d}))
    }
    else if (direction === 'left') {
      setTranslate(prev => ({x: prev.x-d, y: prev.y}))
    }
    else if (direction === 'right') {
      setTranslate(prev => ({x: prev.x+d, y: prev.y}))
    }
  }

  const modeHandler = (icon: 'pen'|'eraser') => {
    if (mode !== "edit" && icon === 'pen') {
      setPath(null);
      setMode('edit')
    }
    else if (mode !== 'erase' && icon === 'eraser') {
      setMode('erase');
      setPath(null)
    }
  }

  return (
    <>
      <button onClick={() => scaleHandler('up')}><FaSearchPlus size={size} style={{...style}}/></button>
      <button onClick={() => scaleHandler('down')}><FaSearchMinus size={size} style={{...style}}/></button>
      <button onClick={() => translateHandler('up')}><FaArrowUp size={size} style={{...style}}/></button>
      <button onClick={() => translateHandler('down')}><FaArrowDown size={size} style={{...style}}/></button>
      <button onClick={() => translateHandler('left')}><FaArrowLeft size={size} style={{...style}}/></button>
      <button onClick={() => translateHandler('right')}><FaArrowRight size={size} style={{...style}}/></button>
      {mode !== 'default'&& (
        <>
        <button onClick={() => modeHandler('pen')} style={{opacity: mode === 'edit' ? 1 : 0.5}}><FaPen size={size} style={{...style}}/></button>
        <button onClick={() => modeHandler('eraser')} style={{opacity: mode === 'erase' ? 1 : 0.5}}><FaEraser size={size} style={{...style}}/></button>
        </>
      )}
      {/* <select
        name="mode"
        onChange={(e) => {
          setMode(e.target.value);
          // setPath(null);
        }}
        value={mode}
      >
        {modeOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select> */}
    </>
  )
}

export default ToolWidget