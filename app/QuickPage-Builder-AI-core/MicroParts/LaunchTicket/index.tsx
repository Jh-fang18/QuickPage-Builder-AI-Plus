"use client";

// 导入样式
import "./style.css";

// 导入已有组件
import { useMemo } from "react";
import Icon, { HomeOutlined } from "@ant-design/icons";

// 导入类型
import {
  LaunchTicketBaseData,
  LaunchTicketDataItem,
} from "@/app/QuickPage-Builder-AI-core/MicroParts/types/common";

const LaunchTicket = ({
  rowSpan,
  colSpan,
  gridSize,
  gridSpace,
  title,
  data,
}: {
  rowSpan?: number;
  colSpan?: number;
  gridSize: number;
  gridSpace: number;
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
      gridSize,
      gridSpace,
      data: data || [],
    };
  }, [rowSpan, colSpan, gridSize, gridSpace, data]);

  // ======================
  // 计算属性
  // ======================

  // 计算样式
  const style = (baseData: LaunchTicketBaseData) => {
    let { minRowSpan, minColSpan, rowSpan, colSpan, gridSize, gridSpace } =
      baseData;
    rowSpan = rowSpan > minRowSpan ? rowSpan : minRowSpan;
    colSpan = colSpan > minColSpan ? colSpan : minColSpan;
    let width = rowSpan * gridSize + (rowSpan - 1) * gridSpace;
    let height = colSpan * gridSize + (colSpan - 1) * gridSpace;
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
    <div className="launch-ticket" style={style(baseData)}>
      <div className="launch-ticket-header">
        <span className="title">{title}</span>
      </div>
      <div className="launch-ticket-content">
        {baseData.data?.length > 0
          ? baseData.data.map((item, index) => (
              <div key={index} className="launch-ticket-item">
                <div className="title">
                  <div
                    className="item-inner-icon"
                    style={{ backgroundImage: item.color }}
                  >
                    <Icon
                      component={
                        HomeOutlined as React.ForwardRefExoticComponent<any>
                      }
                    ></Icon>
                  </div>
                  <div className="item-inner-name">{item.showName}</div>
                </div>
                <div className="content">{item.explain}</div>
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
});;

export default LaunchTicket;
