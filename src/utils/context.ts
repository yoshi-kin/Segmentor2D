import React, { Dispatch, SetStateAction } from 'react'
import { Label, ImageProps, Point, Path } from '../types'

export const labelContext = React.createContext<{
  labels: Label[],
  selectedLabelId: string,
  setLabels: Dispatch<SetStateAction<Label[]>>,
  setSelectedLabelId: Dispatch<SetStateAction<string>>,
}>({
  labels: [],
  selectedLabelId: '',
  setLabels: () => [],
  setSelectedLabelId: () => ''
})

export const imageContext = React.createContext<{
  images: {[id:string]: ImageProps},
  path: Path|null
  setImages: Dispatch<SetStateAction<{[id:string]: ImageProps}>>,
  setPath: Dispatch<SetStateAction<Path|null>>
}>({
  images: {},
  path: null,
  setImages: () => {},
  setPath: () => {}
})

export const toolContext = React.createContext<{
  mode: string,
  scale: number,
  translate: Point,
  setMode: Dispatch<SetStateAction<string>>,
  setScale: Dispatch<SetStateAction<number>>,
  setTranslate: Dispatch<SetStateAction<Point>>
}>({
  mode: 'default',
  scale: 1,
  translate: {x: 0, y: 0},
  setMode: () => {},
  setScale: () => {},
  setTranslate: () => {}
})