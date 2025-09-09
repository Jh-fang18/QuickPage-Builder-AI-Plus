import { useContext } from "react";

import ContainerPC from "../../../MicroParts/ContainerPC/index";

import { ComponentItem } from "../../../types/common";
import type { MicroCardsType } from "../../../types/common";

import EditContext from "../context";

export default function Core(props: {
  terminalType: number;
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
  MicroCards: MicroCardsType;
  moduleProps: {
    zIndex: number;
  };
  html: boolean;
}) {
  const { activatedComponents, getActivatedComponents } =
    useContext(EditContext);

  const handleSetActivatedComponents = (components: ComponentItem[]) => {
    //console.log("TOP", components);
    getActivatedComponents([...components]);
  };

  return (
    <ContainerPC
      html={props.html}
      gridRow={props.gridRow}
      gridColumn={props.gridColumn}
      gridScale={props.gridScale}
      gridPadding={props.gridPadding}
      MicroCards={props.MicroCards}
      activatedComponents={activatedComponents}
      onActivatedComponents={handleSetActivatedComponents}
      moduleProps={props.moduleProps}
    />
  );
}
