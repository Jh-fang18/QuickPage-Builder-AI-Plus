import HTML from "./HTML";
import Core from "./core";

import type { ContainerPCProps } from "../types/common";

/**
 * ContainerPC 组件
 *
 * 这是一个容器组件，根据 `html` 属性的值来决定渲染 HTML 版本还是 Core 版本。
 * 它接收一系列属性并将其传递给相应的子组件。
 */
const ContainerPC = (props: ContainerPCProps) => {
  return props.html ? (
    <HTML
      gridRow={props.gridRow}
      gridColumn={props.gridColumn}
      gridScale={props.gridScale}
      gridPadding={props.gridPadding}
      MicroCards={props.MicroCards}
      activatedComponents={props.activatedComponents}
      currentIndex={props.currentIndex}
      moduleProps={props.moduleProps}
    />
  ) : (
    <Core
      gridRow={props.gridRow}
      gridColumn={props.gridColumn}
      gridScale={props.gridScale}
      gridPadding={props.gridPadding}
      MicroCards={props.MicroCards}
      activatedComponents={props.activatedComponents}
      onActivatedComponents={props.onActivatedComponents}
      currentIndex={props.currentIndex}
      moduleProps={props.moduleProps}
    />
  );
};

// 静态方法
/**
 * 获取容器的最小形状配置
 * @returns 包含最小列跨度和最小行跨度的对象
 */
ContainerPC.minShape = () => ({
  minColSpan: 16, // 最小宽占格
  minRowSpan: 12, // 最小高占格
});

ContainerPC.requiredProps = ["MicroCards", "html", "onActivatedComponents"];

export default ContainerPC;
