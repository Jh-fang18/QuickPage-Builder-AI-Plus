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
  //HTML展示是无需向上传递activatedComponents，故分离出onActivatedComponents回调函数
  const { onActivatedComponents, ...restProps } = props;
  return props.html ? <HTML {...restProps} /> : <Core {...props} />;
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

ContainerPC.requiredProps = ["html", "MicroCards", "onActivatedComponents"];

export default ContainerPC;
