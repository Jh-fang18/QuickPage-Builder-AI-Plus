import { useContext } from "react";

import ContainerPC from "../../../MicroParts/ContainerPC/index";

import { ComponentItem } from "../../../types/common";
import type { MicroCardsType } from "../../../types/common";

import EditContext from "../context";

export default function Core({
  terminalType,
  gridRow,
  gridColumn,
  gridScale,
  gridPadding,
  MicroCards
}: {
  terminalType: number;
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
  MicroCards: MicroCardsType;

}) {
  const { activatedComponents, setActivatedComponents } = useContext<{
    activatedComponents: ComponentItem[];
    setActivatedComponents: React.Dispatch<
      React.SetStateAction<ComponentItem[]>
    >;
  }>(EditContext);

  return (
    <ContainerPC
      gridRow={gridRow}
      gridColumn={gridColumn}
      gridScale={gridScale}
      gridPadding={gridPadding}
      MicroCards={MicroCards}
      activatedComponents={activatedComponents}
      setActivatedComponents={setActivatedComponents}
    />
  );
}
