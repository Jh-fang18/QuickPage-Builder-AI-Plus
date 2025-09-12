// 导入样式
import styles from "./styles.module.css";

import { Form } from "antd";

import ContainerPC from "../ContainerPC/index";

// 导入类型
import type { FormMPProps, FormMPDataItem } from "../types/common";

// 导入自有hooks
import { useBaseData } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useBaseData";
import { useStyleCalculator } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useStyleCalculator";
import { useEffect } from "react";

// 定义一个空函数，用于处理事件属性
const createEmptyFunction = (
  name: string,
  parameters: Array<{ name: string; type: string; required: boolean }>
) => {
  return (...args: any[]) => {
    // 根据参数定义处理传入的参数
    const params: Record<string, any> = {};
    parameters.forEach((param, index) => {
      // 检查必需参数是否提供了值
      if (param.required && (args[index] === undefined || args[index] === null)) {
        console.warn(`Required parameter "${param.name}" is missing for function "${name}"`);
      }
      params[param.name] = args[index];
    });
    console.log('Form event triggered with params:', params);
    
    // 特定事件处理
    if (name === "onFinish") {
       console.log("Form values:", params.values);
    }
  };
};

const FormMP = (props: FormMPProps) => {
  // 基础静态数据获取和定义
  const baseData = useBaseData<FormMPDataItem, FormMPProps["moduleProps"]>({
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

  // 从 itemProps 中排除 gridScale 和 gridPadding 属性
  // 这些不是 Form 组件的原生属性，需要分离
  const { gridScale: _gridScale, gridPadding: _gridPadding, ...filteredItemProps } =
    baseData.data[0].itemProps || {};

  // 处理 itemProps 中的函数类型属性
  const processedItemProps = { ...filteredItemProps };
  
  // 遍历 filteredItemProps，查找函数类型的属性
  Object.keys(filteredItemProps).forEach(key => {
    const propValue = (filteredItemProps as any)[key];
    
    // 检查属性是否为对象且具有 type:"function"
    if (propValue && typeof propValue === 'object' && propValue.type === "function") {
      // 创建对应的空函数并替换属性值
      processedItemProps[key as keyof typeof processedItemProps] = createEmptyFunction(key, propValue.parameters || []);
    }
  });

  return (
    <Form
      {...processedItemProps}
      style={{ width, height }}
      name={baseData.data[0].name + "_" + props.currentIndex}
      initialValues={{ remember: true }}
      autoComplete="off"
      form={form}
    >
      <ContainerPC {...props} />
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
