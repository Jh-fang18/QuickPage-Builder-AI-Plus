import type { ComponentItem } from "../../../types/common";

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
        <div>
            我是组件预览容器
        </div>
    );
}
