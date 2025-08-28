import HTML from "./HTML";
import Core from "./core";

import type { ContainerPCProps } from "../types/common";

/**
 * ContainerPC 组件
 * 
 * 这是一个容器组件，根据 `html` 属性的值来决定渲染 HTML 版本还是 Core 版本。
 * 它接收一系列属性并将其传递给相应的子组件。
 */
const ContainerPC = ({
  /** 网格行数 */
  gridRow,
  /** 网格列数 */
  gridColumn,
  /** 网格缩放比例 */
  gridScale,
  /** 网格内边距 */
  gridPadding,
  /** 微卡片数据 */
  MicroCards,
  /** 激活的组件列表 */
  activatedComponents,
  /** 更新激活组件列表的回调函数 */
  onActivatedComponents,
  /** 当前索引，默认为 "-1" */
  currentIndex = "-1",
  /** 模块属性，默认 zIndex 为 0 */
  moduleProps = {
    zIndex: 0,
  },
  /** 是否使用 HTML 版本，默认为 false */
  html = false,
}: ContainerPCProps) => {

  return html ? (
    <HTML
      gridRow={gridRow}
      gridColumn={gridColumn}
      gridScale={gridScale}
      gridPadding={gridPadding}
      MicroCards={MicroCards}
      activatedComponents={activatedComponents}
      currentIndex={currentIndex}
      moduleProps={moduleProps}
    />
  ) : (
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
/**
 * 获取容器的最小形状配置
 * @returns 包含最小列跨度和最小行跨度的对象
 */
ContainerPC.minShape = () => ({
  minColSpan: 16, // 最小宽占格
  minRowSpan: 12, // 最小高占格
});

export default ContainerPC;
