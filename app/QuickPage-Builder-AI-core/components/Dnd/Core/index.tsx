import type { ComponentItem } from "../../types/dnd";

import ContainerPC from "./container-pc";

export default function Core({
  terminalType,
  activatedComponents,
  gridRow,
  gridColumn,
  gridScale,
  gridPadding,
}: {
  terminalType: number;
  activatedComponents: ComponentItem[];
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
}) {
  return (
    <ContainerPC
      activatedComponents={activatedComponents}
      gridRow={gridRow}
      gridColumn={gridColumn}
      gridScale={gridScale}
      gridPadding={gridPadding}
    />
  );
}
