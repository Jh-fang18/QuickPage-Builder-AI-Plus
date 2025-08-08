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
  rowSpan,
  colSpan,
  gridScale,
  gridPadding,
  title,
  data,
}: {
  rowSpan?: number;
  colSpan?: number;
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
      minRowSpan: minColSpan, // 最小宽占格
      minColSpan: minColSpan, // 最小高占格
      rowSpan: rowSpan || minRowSpan,
      colSpan: colSpan || minColSpan,
      gridScale,
      gridPadding,
      data: data || [],
    };
  }, [rowSpan, colSpan, gridScale, gridPadding, data]);

  // ======================
  // 计算属性
  // ======================

  // 计算样式
  const style = (baseData: LaunchTicketProps) => {
    let { minRowSpan, minColSpan, rowSpan, colSpan, gridScale, gridPadding } =
      baseData;
    //console.log(baseData)
    rowSpan = rowSpan > minRowSpan ? rowSpan : minRowSpan;
    colSpan = colSpan > minColSpan ? colSpan : minColSpan;
    let width = rowSpan * gridScale + (rowSpan - 1) * gridPadding;
    let height = colSpan * gridScale + (colSpan - 1) * gridPadding;

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
  minRowSpan: 8, // 最小宽占格
  minColSpan: 6, // 最小高占格
});

export default LaunchTicket;
