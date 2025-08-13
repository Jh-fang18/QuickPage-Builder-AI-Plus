import { useContext, useEffect } from "react";

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
  zIndex,
  MicroCards,

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
    console.log(components)
    setActivatedComponents([...components]);
  };

  useEffect(() => {
    console.log("core", activatedComponents);
  },[activatedComponents])

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
