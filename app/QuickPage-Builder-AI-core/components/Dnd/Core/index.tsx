import type { ComponentItem } from "../../types/dnd";

import ContainerPC from "./container-pc";

export default function Core({
  terminalType,
  gridRow,
  gridColumn,
  gridScale,
  gridPadding,
}: {
  terminalType: number;
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
}) {
  return (
    <ContainerPC
      gridRow={gridRow}
      gridColumn={gridColumn}
      gridScale={gridScale}
      gridPadding={gridPadding}
    />
  );
}
