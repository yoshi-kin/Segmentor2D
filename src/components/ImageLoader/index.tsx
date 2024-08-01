import React, { InputHTMLAttributes, forwardRef } from "react";
import { imgContext } from "../../utils/context";

export type Props = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id: InputHTMLAttributes<HTMLInputElement>["id"];
};

const InputImage = forwardRef<HTMLInputElement, Props>(
  ({ onChange, id }, ref) => {
    return (
      <input
        ref={ref}
        id={id}
        type="file"
        accept="image/*"
        onChange={onChange}
        hidden
      />
    );
  }
);

const ImageLoader = () => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const {imgSrc, setImgSrc} = React.useContext(imgContext)
  const FIELD_SIZE = 210;

  return (
    <>
      <label
        htmlFor="image_id"
        style={{
          border: "white 3px dotted",
          width: FIELD_SIZE,
          height: FIELD_SIZE,
          display: 'flex',
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
      >
        ＋画像をアップロード
        <InputImage
          ref={fileInputRef}
          id='image_id'
          onChange={(e) => setImgSrc(e.target.value)}
        />
        <div style={{height: 20}}/>
        {/* <button onClick={() => ()}>キャンセル</button> */}
      </label>
    </>
  )
}

export default ImageLoader