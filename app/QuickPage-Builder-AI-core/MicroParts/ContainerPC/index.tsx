import HTML from "./HTML";
import Core from "./core";

import type { MicroCardsType } from "../../types/common";
import type { ComponentItem } from "../../types/common";

const ContainerPC = ({
  gridRow,
  gridColumn,
  gridScale,
  gridPadding,
  MicroCards,
  activatedComponents,
  onActivatedComponents,
  currentIndex = "-1",
  moduleProps = {
    zIndex: 0,
  },
}: {
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
  MicroCards: MicroCardsType;
  activatedComponents: ComponentItem[];
  onActivatedComponents: (activatedComponents: ComponentItem[]) => void;
  currentIndex?: string;
  moduleProps?: {
    zIndex: number;
  };
}) => {
  return (
    <Core
      gridRow={gridRow}
      gridColumn={gridColumn}
      gridScale={gridScale}
      gridPadding={gridPadding}
      MicroCards={MicroCards}
      activatedComponents={activatedComponents}
      onActivatedComponents={onActivatedComponents}
      currentIndex={currentIndex}
      moduleProps={moduleProps}
    />
  );
};

// 静态方法
ContainerPC.minShape = () => ({
  minColSpan: 16, // 最小宽占格
  minRowSpan: 12, // 最小高占格
});

export default ContainerPC;
