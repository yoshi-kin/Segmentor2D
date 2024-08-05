import React from 'react'
import { ImageProps, Label } from '../../types'
import { rgbToHex } from '../../utils/helper'
import { imageContext, labelContext } from '../../utils/context'
import { FiMinus } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';

type Props = {
  label: Label,
  onClick: () => void,
}

const LabelBox = React.forwardRef<HTMLButtonElement, Props>(({label, onClick}, ref) => {
  const {images, setImages} = React.useContext(imageContext);
  const {selectedLabelId, setLabels, setSelectedLabelId} = React.useContext(labelContext);

  const colorHandler = (elementId: string) => {
    console.log('clicked');
    const element = document.getElementById(elementId);
    if (element) navigator.clipboard.writeText(element.textContent!);
  }

  const removeHandler = (labelId: string) => {
    console.log('remove label');
    if (!confirm("Is the label removed ?")) return;
    const newImages: {[id:string]: ImageProps} = {}
    for (const imageId of Object.keys(images)) {
      newImages[imageId] = {
        ...images[imageId],
        instances: images[imageId].instances.filter(prev => prev.label.id !== labelId)
      }
    }
    setImages(newImages);
    setLabels(prev => (prev.filter(label => label.id !== labelId)))
    if (selectedLabelId !== labelId) setSelectedLabelId('');
  }

  return (
    <button
      // id={label.id}
      ref={ref}
      style={{
        border: '1px solid white',
        backgroundColor: '#ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: "18px",
        padding: "5px"
      }}
      onClick={onClick}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'start',
        }}
      >
        <button
          id="remove-label"
          style={{
            // backgroundColor: '#ddd',
            border: "none",
            padding: "5px",
            borderRadius: "5px",
          }}
          onClick={() => removeHandler(label.id)}
        >
          <FiMinus size={20}/>
        </button>
      </div>
      <div
        style={{
          alignItems: 'center',
          justifyContent: 'end',
        }}
      >
        <label>
          {/* {label.color.hex} */}
          {label.name}
        </label>
        <label id={label.id} hidden>{label.color.hex}</label>{" "}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <input
            type="color"
            value={rgbToHex(label.color.rgb)!}
            style={{
              // display: 'flex',
              width: '25px',
              height: '25px',
              pointerEvents: "none",
              // cursor: 'pointer'
            }}
            // onClick={() => colorHandler(label.id)}
            disabled
          />
          <div
            id="copy-color"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '25px',
              height: '25px',
              cursor: 'pointer',
              background: 'transparent'
            }}
            onClick={() => colorHandler(label.id)}
          />
        </div>
      </div>
      <Tooltip
        anchorSelect="#remove-label"
        content="remove label"
      />
      <Tooltip
        anchorSelect="#copy-color"
        content="copy color"
      />
    </button>
  )
})

export default LabelBox