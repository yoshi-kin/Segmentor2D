import React from 'react'
import { imageContext, labelContext, toolContext } from '../../utils/context'
import LabelBox from './LabelBox';
import LabelAdd from './LabelAdd';

const LabelWidget = () => {
  const {labels, selectedLabelId, setSelectedLabelId} = React.useContext(labelContext);
  const {setMode} = React.useContext(toolContext);
  const {setPath} = React.useContext(imageContext);
  const [add, setAdd] = React.useState(false);
  const labelBoxRefs = React.useRef<{[key:string]: HTMLButtonElement}>({});

  React.useEffect(() => {
    if (!selectedLabelId) {
      Object.keys(labelBoxRefs.current).map((key) => {
        labelBoxRefs.current[key].style.border = '1px solid white';
      });
      setMode('default');
      setPath(null);
      return;
    }
    console.log(selectedLabelId);
    const selectedRef = labelBoxRefs.current[selectedLabelId];
    if (selectedRef) {
      selectedRef.style.border = '2px solid red';
      setMode('edit')
      setPath(null);
    }

    Object.keys(labelBoxRefs.current).map((key) => {
      if (key !== selectedLabelId && labelBoxRefs.current[key]) {
        labelBoxRefs.current[key].style.border = '1px solid white';
      }
    });
  }, [selectedLabelId])

  const onClickHandler = (id: string) => {
    if (selectedLabelId === id) {
      setSelectedLabelId('');
    }
    else {
      setSelectedLabelId(id);
    }
  }

  return (
    <div>
      <div>
        <h4 style={{margin:0, padding:0}}>Label List</h4>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent:'space-between'
        }}
      >
        <button
          style={{
            display: 'flex',
            justifyContent: 'start',
          }}
          onClick={() => setAdd(true)}
        >
          +Add
        </button>
        {add && (
          <button
            style={{
              display: 'flex',
              justifyContent: 'end',
            }}
            onClick={() => setAdd(false)}
          >
            Cancel
          </button>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {add
          ? <LabelAdd setAdd={setAdd}/>
          : labels.map((label) => (
              <LabelBox
                key={label.id}
                ref={(el) => {
                  labelBoxRefs.current[label.id] = el!
                }}
                label={label}
                onClick={() => onClickHandler(label.id)}
              />
            ))
        }
      </div>
    </div>
  )
}

export default LabelWidget