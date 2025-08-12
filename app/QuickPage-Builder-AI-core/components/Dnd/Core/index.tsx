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
  MicroCards,
  zIndex,

}: {
  terminalType: number;
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
  MicroCards: MicroCardsType;
  zIndex: number;
}) {
  const { activatedComponents, setActivatedComponents } = useContext<{
    activatedComponents: ComponentItem[];
    setActivatedComponents: React.Dispatch<
      React.SetStateAction<ComponentItem[]>
    >;
  }>(EditContext);

  const handleSetActivatedComponents = (components: ComponentItem[]) => {
    //setActivatedComponents([...components]);
  };

  //console.log("core", activatedComponents);

  return (
    <ContainerPC
      gridRow={gridRow}
      gridColumn={gridColumn}
      gridScale={gridScale}
      gridPadding={gridPadding}
      MicroCards={MicroCards}
      zIndex={zIndex}
      activatedComponents={activatedComponents}
      onActivatedComponents={handleSetActivatedComponents}
    />
  );
}
