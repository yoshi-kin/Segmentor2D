import React from 'react'
import { Label } from '../../types'
import { rgbToHex } from '../../utils/helper'
import { labelContext } from '../../utils/context'

type Props = {
  label: Label,
  onClick: () => void,
}

const LabelBox = React.forwardRef<HTMLButtonElement, Props>(({label, onClick}, ref) => {
  const colorHandler = (elementId: string) => {
    console.log('clicked');
    const element = document.getElementById(elementId);
    if (element) navigator.clipboard.writeText(element.textContent!);
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
        alignItems: 'center'
      }}
      onClick={onClick}
    >
      <label
        htmlFor=""
        style={{
          // display: 'flex',
          justifyContent: 'start',
        }}
      >
        {label.name}
      </label>
      <div
        style={{
          alignItems: 'center',
          justifyContent: 'end',
        }}
      >
        <label
          id={label.id}
        >
          {label.color.hex}
        </label>
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
    </button>
  )
})

export default LabelBox