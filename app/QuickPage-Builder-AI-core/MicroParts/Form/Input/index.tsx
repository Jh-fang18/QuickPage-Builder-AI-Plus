// 导入已有组件
import { Form, Input } from "antd";
import { useEffect } from "react";

// 导入自有hooks
import { useBaseData } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useBaseData";
import { useStyleCalculator } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useStyleCalculator";

// 导入类型
import type { InputMPProps, InputDataItem } from "../../types/common";

const InputMP = ({
  gridColumn,
  gridRow,
  gridScale,
  gridPadding,
  currentIndex,
  moduleProps,
  data,
}: InputMPProps) => {
  // ======================
  // 私有响应状态
  // ======================

  // 基础静态数据获取和定义
  const baseData = useBaseData<InputDataItem>({
    gridColumn,
    gridRow,
    gridScale,
    gridPadding,
    data,
    moduleProps,
    minShape: InputMP.minShape,
  });
  const form = Form.useFormInstance();

  // 根据data中传入的类型定义FieldType
  const inputType = `${baseData.data[0].nameType}_${currentIndex}`;
  type FieldType = Record<typeof inputType, InputDataItem["nameValue"]>;

  // ======================
  // 计算属性
  // ======================

  // 计算样式
  const { width, height } = useStyleCalculator(baseData);

  // ======================
  // 副作用
  // ======================

  useEffect(() => {
    form.setFieldValue(
      inputType,
      baseData.data[0]?.itemProps.initialValue || ""
    );
  }, [baseData.data[0]?.itemProps.initialValue || null]);

  return (
    <Form.Item<FieldType>
      {...(baseData.data[0]?.itemProps || {})}
      name={inputType}
      style={{ width, height, margin: 0 }}
    >
      <Input />
    </Form.Item>
  );
};

// 静态方法
InputMP.minShape = () => ({
  minColSpan: 6, // 最小高占格
  minRowSpan: 1, // 最小宽占格
});

export default InputMP;
