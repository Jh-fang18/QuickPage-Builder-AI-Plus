"use client";

// 导入样式
import styles from "./styles.module.css";

// 导入已有组件
import { useMemo } from "react";
import Icon, { HomeOutlined } from "@ant-design/icons";

// 导入类型
import {
  LaunchTicketProps,
  LaunchTicketDataItem,
} from "@/app/QuickPage-Builder-AI-core/MicroParts/types/common";

const LaunchTicket = ({
  gridColumn,
  gridRow,
  gridScale,
  gridPadding,
  title,
  data,
}: {
  gridColumn?: number;
  gridRow?: number;
  gridScale: number;
  gridPadding: number;
  title: string;
  data?: LaunchTicketDataItem[];
}) => {
  // ======================
  // 私有响应状态
  // ======================

  // 基础静态数据获取和定义
  const baseData = useMemo(() => {
    const { minRowSpan, minColSpan } = LaunchTicket.minShape();

    return {
      minRowSpan: minRowSpan, // 最小高占格
      minColSpan: minColSpan, // 最小宽占格
      gridRow: gridRow || minRowSpan,
      gridColumn: gridColumn || minColSpan,
      gridScale,
      gridPadding,
      data: data || [],
    };
  }, [gridRow, gridColumn, gridScale, gridPadding, data]);

  // ======================
  // 计算属性
  // ======================

  // 计算样式
  const style = (baseData: LaunchTicketProps) => {
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
    <div className={`${styles["launch-ticket"]}`} style={style(baseData)}>
      <div className={`${styles["launch-ticket-header"]}`}>
        <span className={`${styles["title"]}`}>{title}</span>
      </div>
      <div className={`${styles["launch-ticket-content"]}`}>
        {baseData.data?.length > 0
          ? baseData.data.map((item, index) => (
              <div key={index} className={`${styles["launch-ticket-item"]}`}>
                <div className={`${styles["title"]}`}>
                  <div
                    className={`${styles["item-inner-icon"]}`}
                    style={{ backgroundImage: item.color }}
                  >
                    <Icon
                      component={
                        HomeOutlined as React.ForwardRefExoticComponent<any>
                      }
                    ></Icon>
                  </div>
                  <div className={`${styles["item-inner-name"]}`}>
                    {item.showName}
                  </div>
                </div>
                <div className={`${styles["content"]}`}>{item.explain}</div>
              </div>
            ))
          : null}
      </div>
    </div>
  );
};

// 静态方法
LaunchTicket.minShape = () => ({
  minColSpan: 8, // 最小高占格
  minRowSpan: 6, // 最小宽占格
});

export default LaunchTicket;
