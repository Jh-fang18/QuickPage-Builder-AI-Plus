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
  moduleProps = {
    zIndex: 0,
  },
}: {
  terminalType: number;
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
  MicroCards: MicroCardsType;
  moduleProps: {
    zIndex: number;
  };
}) {
  const { activatedComponents, getActivatedComponents } =
    useContext(EditContext);

  const handleSetActivatedComponents = (components: ComponentItem[]) => {
    //console.log("TOP", components);
    getActivatedComponents([...components]);
  };

  return (
    <ContainerPC
      gridRow={gridRow}
      gridColumn={gridColumn}
      gridScale={gridScale}
      gridPadding={gridPadding}
      MicroCards={MicroCards}
      activatedComponents={activatedComponents}
      onActivatedComponents={handleSetActivatedComponents}
      moduleProps={moduleProps}
    />
  );
}
