// 导入样式
import styles from "./styles.module.css";

import { Form } from "antd";

import ContainerPC from "../ContainerPC/index";

import { ComponentItem } from "../../types/common";
import { FormMPProps, FormMPDataItem } from "../types/common";

// 导入自有hooks
import { useBaseData } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useBaseData";
import { useStyleCalculator } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useStyleCalculator";

const FormMP = (props: FormMPProps) => {
  // 基础静态数据获取和定义
  const baseData = useBaseData<
    FormMPDataItem,
    FormMPProps["moduleProps"]
  >({
    gridColumn: props.gridColumn,
    gridRow: props.gridRow,
    gridScale: props.gridScale,
    gridPadding: props.gridPadding,
    data: props.data,
    moduleProps: props.moduleProps,
    minShape: FormMP.minShape,
  });
  
  // ======================
  // 计算属性
  // ======================

  // 计算样式
  const { width, height } = useStyleCalculator(baseData);

  const [form] = Form.useForm();

  // 从 itemProps 中排除 submitText 属性
  // submitText不是Button自带的属性，故需分离
  const { gridPadding: _gridPadding, ...filteredItemProps } =
    baseData.data[0].itemProps || {};

  return (
    <Form
      {...filteredItemProps}
      style={{ width, height }}
      name={baseData.data[0].name + "_" + props.currentIndex}
      initialValues={{ remember: true }}
      autoComplete="off"
      form={form}
    >
      <ContainerPC
        {...props}
      />
    </Form>
  );
};

// 静态方法
FormMP.minShape = () => ({
  minColSpan: 8, // 最小高占格
  minRowSpan: 6, // 最小宽占格
});

FormMP.requiredProps = ["MicroCards", "html", "onActivatedComponents"];

export default FormMP;
