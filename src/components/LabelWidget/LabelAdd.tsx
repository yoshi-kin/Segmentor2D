import React, { Dispatch, SetStateAction } from 'react'
import { labelContext } from '../../utils/context'
import { hexToRgb, hexToRgba } from '../../utils/helper';

type Props = {
  setAdd: Dispatch<SetStateAction<boolean>>
}

const LabelAdd = ({setAdd}: Props) => {
  const {setLabels} = React.useContext(labelContext);
  const labelRef = React.useRef<HTMLInputElement>(null);
  const colorRef = React.useRef<HTMLInputElement>(null);

  const saveHandler = (e) => {
    e.preventDefault();
    if (labelRef.current && colorRef.current) {
      console.log(labelRef.current.value);
      console.log(colorRef.current.value);
      setLabels(prev => [
        ...prev,
        {
          id: self.crypto.randomUUID(),
          name: labelRef.current!.value,
          color: {
            id: self.crypto.randomUUID(),
            hex: colorRef.current!.value,
            rgb: hexToRgb(colorRef.current!.value),
            rgba: hexToRgba(colorRef.current!.value),
          }
        }
      ])
    }
    setAdd(false);
  }

  return (
    <div>
      <div>
        <label htmlFor="">Label</label>
        <input type="text" ref={labelRef}/>
      </div>
      <div>
        <label htmlFor="">Color</label>
        <input type="color" ref={colorRef}/>
      </div>
      <div>
        <button onClick={saveHandler}>OK</button>
      </div>
    </div>
  )
}

export default LabelAdd