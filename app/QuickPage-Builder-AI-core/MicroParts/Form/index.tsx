// 导入样式
import styles from "./styles.module.css";

import { Form } from "antd";

import ContainerPC from "../ContainerPC/index";

import { ComponentItem } from "../../types/common";
import type { MicroCardsType } from "../../types/common";

export default function FormMP({
  containerIndex = "-1",
  zIndex = 0,
  gridRow,
  gridColumn,
  gridScale,
  gridPadding,
  MicroCards,
  activatedComponents,
  onActivatedComponents,
}: {
  containerIndex?: string;
  zIndex?: number;
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
  MicroCards: MicroCardsType;
  activatedComponents: ComponentItem[];
  onActivatedComponents: (components: ComponentItem[], index?: string) => void;
}) {
  const handleSetActivatedComponents = (components: ComponentItem[]) => {
    onActivatedComponents([...components], containerIndex);
  };

  return (
    <Form name="basic" initialValues={{ remember: true }} autoComplete="off">
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
    </Form>
  );
}

// 静态方法
FormMP.minShape = () => ({
  minColSpan: 16, // 最小高占格
  minRowSpan: 12, // 最小宽占格
});
