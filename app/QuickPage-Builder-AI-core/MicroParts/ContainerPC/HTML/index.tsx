"use client";

import { useMemo, useState, Suspense, useEffect } from "react";

// 导入类型
import type { ContainerPCHTMLProps } from "../../types/common";
import type { ComponentItem } from "../../../types/common";

// 导入函数
import { dynamicComponent } from "../utils";

import "./styles.html.css";

/**
 * HTML 组件
 * 这是一个容器组件，根据 `html` 属性的值来决定渲染 HTML 版本还是 Core 版本。
 * 它接收一系列属性并将其传递给相应的子组件。
 * 用于显示用户可用的界面
 * @param {ContainerPCProps} props - 组件的属性
 * @returns {JSX.Element} 渲染后的组件
 */
export default function HTML({
  html,
  gridColumn,
  gridRow,
  gridScale,
  gridPadding,
  MicroCards,
  activatedComponents,
  currentIndex = "-1",
  moduleProps = {
    zIndex: 0,
  },
}: ContainerPCHTMLProps) {
  // ======================
  // 响应式变量
  // ======================

  const [_activatedComponents, _setActivatedComponents] = useState<
    ComponentItem[]
  >(activatedComponents ? [...activatedComponents] : []);

  // ======================
  // 计算属性
  // ======================

  // 计算网格列数
  const getGridTemplateColumns = useMemo(() => {
    return Array(gridColumn).fill(`${gridScale}px`).join(" ");
  }, [gridColumn, gridScale]);

  // 计算网格行数
  const getGridTemplateRows = useMemo(() => {
    return Array(gridRow).fill(`${gridScale}px`).join(" ");
  }, [gridRow, gridScale]);

  /* ====================== 核心方法 ====================== */

  // ======================
  // 工具函数
  // ======================

  /** end **/

  // ======================
  // 控制元素大小函数
  // ======================

  /** end **/

  useEffect(() => {
    _setActivatedComponents([...activatedComponents]);
  }, [activatedComponents]);

  return (
    <>
      <div
        className={`html-container pc`}
        style={{
          width: (gridScale + gridPadding) * gridColumn - gridPadding + "px",
          gridTemplateColumns: getGridTemplateColumns,
          gridTemplateRows: getGridTemplateRows,
          // gridTemplateAreas: getGridTemplateAreas,
          backgroundSize: `${gridScale + gridPadding}px ${
            gridScale + gridPadding
          }px`,
          zIndex: moduleProps.zIndex,
          ...({ "--grid-gap": `${gridPadding}px` } as React.CSSProperties), //断言自定义属性为CSSProperties合法属性
        }}
      >
        {_activatedComponents.map((item, index) => (
          <div
            key={index}
            className={`block`}
            style={{
              top: item.positionY,
              left: item.positionX,
              gridArea: item.ccs,
            }}
          >
            <Suspense fallback={"loading..."}>
              {/* 渲染子元素的HTML版本 */}
              {dynamicComponent({
                currentIndex,
                index,
                gridScale,
                gridPadding,
                MicroCards,
                activatedComponent: item,
                html: html,
              })}
            </Suspense>
          </div>
        ))}
      </div>
    </>
  );
}
