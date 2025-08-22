"use client";

// 导入样式
import styles from "./styles.module.css";

// 导入已有组件
import Icon, { HomeOutlined } from "@ant-design/icons";

// 导入自定义
import { useBaseData } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useBaseData";
import { useStyleCalculator } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useStyleCalculator";

// 导入类型
import {
  LaunchTicketDataItem,
  LaunchTicketProps,
} from "@/app/QuickPage-Builder-AI-core/MicroParts/types/common";

const LaunchTicket = ({
  gridColumn,
  gridRow,
  gridScale,
  gridPadding,
  moduleProps,
  data,
}: LaunchTicketProps) => {
  // ======================
  // 私有响应状态
  // ======================

  // 基础静态数据获取和定义
  const baseData = useBaseData<
    LaunchTicketDataItem,
    LaunchTicketProps["moduleProps"]
  >({
    gridColumn,
    gridRow,
    gridScale,
    gridPadding,
    data,
    moduleProps,
    minShape: LaunchTicket.minShape,
  });

  // ======================
  // 计算属性
  // ======================

  // 导入样式计算hook
  const { width, height } = useStyleCalculator(baseData);

  // ======================
  // 副作用
  // ======================

  return (
    <div className={`${styles["launch-ticket"]}`} style={{ width, height }}>
      <div className={`${styles["launch-ticket-header"]}`}>
        <span className={`${styles["title"]}`}>
          {baseData.moduleProps?.title}
        </span>
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
