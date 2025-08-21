"use client";

// 导入样式
import styles from "./styles.module.css";

// 导入已有组件
import { useMemo } from "react";

// 导入类型
import { InputProps } from "@/app/QuickPage-Builder-AI-core/MicroParts/types/common";

const Input = ({
  gridColumn,
  gridRow,
  gridScale,
  gridPadding,
  label,
  data,
}: InputProps) => {
  // ======================
  // 私有响应状态
  // ======================

  // 基础静态数据获取和定义
  type BaseDataType = typeof baseData;

  const baseData = useMemo(() => {
    const { minRowSpan, minColSpan } = Input.minShape();

    return {
      minRowSpan: minRowSpan, // 最小高占格
      minColSpan: minColSpan, // 最小宽占格
      gridRow: gridRow || minRowSpan,
      gridColumn: gridColumn || minColSpan,
      gridScale,
      gridPadding,
      label,
      data: data || [],
    };
  }, [gridRow, gridColumn, gridScale, gridPadding, label, data]);


  // ======================
  // 计算属性
  // ======================

  // 计算样式
  const style = (baseData: BaseDataType) => {

    let {
      minRowSpan,
      minColSpan,
      gridRow,
      gridColumn,
      gridScale,
      gridPadding,
    } = baseData;
    //console.log(baseData)
    gridRow = gridRow > minRowSpan ? gridRow : minRowSpan;
    gridColumn = gridColumn > minColSpan ? gridColumn : minColSpan;
    let width = gridColumn * gridScale + (gridColumn - 1) * gridPadding;
    let height = gridRow * gridScale + (gridRow - 1) * gridPadding;

    //console.log(width, height);

    return {
      width: `${Math.floor(width)}px`,
      height: `${Math.floor(height)}px`,
    };
  };

  // ======================
  // 副作用
  // ======================

  // 图标组件获取, 依赖data

  return (
    <div className={`${styles["input"]}`} style={style(baseData)}>

    </div>
  );
};

// 静态方法
Input.minShape = () => ({
  minColSpan: 8, // 最小高占格
  minRowSpan: 6, // 最小宽占格
});

export default Input;
