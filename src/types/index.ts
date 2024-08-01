export type Label = {
  id: string,
  name: string,
  color: Color
}

export type Color = {
  id: string,
  hex?: string,
  rgb: string,
  rgba: string,
}

export type Point = {
  x: number,
  y: number
}

export type Path = {
  id: string,
  label: Label,
  sequence: Point[],
  // sequenceId: number,
  length: number,
  isFinish: boolean,
  type?: string,
}

export type Instance = {
  id: string,
  paths: Path[],
  label: Label,
  selected: boolean,
  sequenceId?: number,
}

export type ImageProps = {
  id: string,
  name: string,
  maskName: string,
  instances: Instance[],
}