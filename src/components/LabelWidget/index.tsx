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
        if (!labelBoxRefs.current[key]) return;
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
  console.log("label", labels);

  return (
    <div
      style={{
        // padding: '5px'
      }}
    >
      <div
        style={{
          // backgroundColor: '#f00'
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '10px'
        }}
      >
        <img src="/title_icon.png" width={40} height={40}/>
        <h3 style={{padding: "10px 5px", margin:0, }}>Segmentor 2D</h3>
      </div>
      <hr style={{marginTop: 0}} />
      <div
        style={{
          display: 'flex',
          justifyContent:'space-between',
          padding: "5px 10px"
        }}
      >
        {add ? (
          <button
            style={{
              display: 'flex',
              justifyContent: 'end',
              fontSize: "18px"
            }}
            onClick={() => setAdd(false)}
          >
            Cancel
          </button>
        ) : (
            <button
              style={{
                display: 'flex',
                justifyContent: 'start',
                fontSize: "18px"
              }}
              onClick={() => setAdd(true)}
            >
              +Add
            </button>
        )}

      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '0 10px',
        }}
      >
        {add
          ? <LabelAdd setAdd={setAdd}/>
          : labels.length !== 0 ? (labels.map((label) => (
              <LabelBox
                key={label.id}
                ref={(el) => {
                  labelBoxRefs.current[label.id] = el!
                }}
                label={label}
                onClick={() => onClickHandler(label.id)}
              />
            ))) : <div style={{display: 'flex', justifyContent: 'center', fontWeight: 'bold'}}>No Label</div>
        }
      </div>
    </div>
  )
}

export default LabelWidget