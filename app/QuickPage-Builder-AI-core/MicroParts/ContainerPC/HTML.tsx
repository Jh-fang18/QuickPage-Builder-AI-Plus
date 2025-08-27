"use client";

import { useMemo, useState, createElement, Suspense } from "react";

// 导入类型
import type { MicroCardsType } from "../../types/common";
import type { ComponentItem } from "../../types/common";

import "./styles.css";

export default function HTML({
  gridRow,
  gridColumn,
  gridScale,
  gridPadding,
  MicroCards,
  activatedComponents,
  moduleProps = {
    zIndex: 0,
  },
  currentIndex = "-1",
}: {
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
  MicroCards: MicroCardsType;
  activatedComponents: ComponentItem[];
  moduleProps: {
    zIndex: number;
  };
  currentIndex?: string;
}) {
  // ======================
  // 响应式变量
  // ======================

  const [_activatedComponents, _setActivatedComponents] = useState<
    ComponentItem[]
  >([...activatedComponents]);

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

  // 计算网格区域
  const getGridTemplateAreas = useMemo(() => {
    return Array.from(
      { length: gridRow },
      (_, i) =>
        `'${Array.from(
          { length: gridColumn },
          (_, j) => `g${i + 1}x${j + 1}`
        ).join(" ")}'`
    ).join(" ");
  }, [gridRow, gridColumn]);

  /* ====================== 核心方法 ====================== */

  // ======================
  // 工具函数
  // ======================

  /** end **/

  // ======================
  // 控制元素大小函数
  // ======================

  /** end **/

  const Component = (index: number) => {
    const componentName = _activatedComponents[index].url;
    const _component = MicroCards[componentName];
    const newActivatedComponents = _activatedComponents.map((item, i) =>
      i === index
        ? {
            ...item,
            props: {
              ...(item?.props || {}),
            },
          }
        : item
    );
    if (!_component) return null;

    // 还需添加传入props的类型验证
    return createElement(_component, {
      ...(newActivatedComponents[index]?.props || {}),
      currentIndex: `${currentIndex}-${index}`,
      gridColumn: newActivatedComponents[index]?.props.gridColumn,
      gridRow: newActivatedComponents[index]?.props.gridRow,
      gridScale,
      gridPadding,
      MicroCards,
      moduleProps: newActivatedComponents[index]?.props.moduleProps,
    });
  };

  return (
    <>
      <div
        className={`container pc`}
        style={{
          width: (gridScale + gridPadding) * gridColumn - gridPadding + "px",
          gridTemplateColumns: getGridTemplateColumns,
          gridTemplateRows: getGridTemplateRows,
          gridTemplateAreas: getGridTemplateAreas,
          backgroundSize: `${gridScale + gridPadding}px ${
            gridScale + gridPadding
          }px`,
          zIndex: moduleProps?.zIndex,
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
            <Suspense fallback={"loading..."}>{Component(index)}</Suspense>
          </div>
        ))}
      </div>
    </>
  );
}