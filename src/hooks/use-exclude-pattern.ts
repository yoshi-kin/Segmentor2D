import React from "react"
import excludePatternSrc from './xpattern.ts';

export default () => {
  const excludePattern = React.useRef<{image: HTMLImageElement, pattern: any} | null>(null);
  if (excludePattern.current === null) {
    excludePattern.current = {
      image: new Image(),
      pattern: null,
    }
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const context = canvas.getContext('2d');

    excludePattern.current.image.onload = () => {
      excludePattern.current!.pattern = context?.createPattern(
        excludePattern.current!.image,
        "repeat"
      )
    }
    excludePattern.current.image.src = excludePatternSrc;
  }
  return excludePattern.current.pattern;
}