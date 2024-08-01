import React from "react";
import { Path } from "../types";

export const usePath = () => {
  const [path, setPath] = React.useState<Path|null>(null);
  return [path, setPath] as const;
}