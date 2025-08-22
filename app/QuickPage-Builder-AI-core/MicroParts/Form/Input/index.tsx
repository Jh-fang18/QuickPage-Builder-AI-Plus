"use client";

// 导入样式
import styles from "./styles.module.css";

// 导入已有组件
import { Form, Input } from "antd";

// 导入自有组件
import { useBaseData } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useBaseData";
import { useStyleCalculator } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useStyleCalculator";

// 导入类型
import {
  InputMPProps,
  InputDataItem,
} from "@/app/QuickPage-Builder-AI-core/MicroParts/types/common";

const InputMP = ({
  gridColumn,
  gridRow,
  gridScale,
  gridPadding,
  data,
  moduleProps,
}: InputMPProps) => {
  // ======================
  // 私有响应状态
  // ======================

  // 基础静态数据获取和定义
  const baseData = useBaseData<InputDataItem, InputMPProps['moduleProps']>({
    gridColumn,
    gridRow,
    gridScale,
    gridPadding,
    data,
    moduleProps,
    minShape: InputMP.minShape,
  });

  // ======================
  // 计算属性
  // ======================

  // 计算样式
  const { width, height } = useStyleCalculator(baseData);

  // ======================
  // 副作用
  // ======================

  // 根据data中传入的类型定义FieldType
  const inputType = baseData.data[0].inputType;
  type FieldType = {
    [inputType]: InputDataItem["value"];
  };

  return (
    <Form.Item<FieldType>
      label={baseData.moduleProps?.label}
      name={baseData.data[0].inputType}
      rules={[{ required: true, message: "Please input your username!" }]}
      className={`${styles["inputMP"]}`}
      style={{ width, height }}
    >
      <Input />
    </Form.Item>
  );
};

// 静态方法
InputMP.minShape = () => ({
  minColSpan: 6, // 最小高占格
  minRowSpan: 2, // 最小宽占格
});

export default InputMP;
