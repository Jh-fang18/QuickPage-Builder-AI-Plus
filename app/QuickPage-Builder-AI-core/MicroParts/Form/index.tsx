// 导入样式
import styles from "./styles.module.css";

import { Form } from "antd";

import ContainerPC from "../ContainerPC/index";

import { ComponentItem } from "../../types/common";
import { FormMPProps, FormMPPropsItem } from "../types/common";

// 导入自有hooks
import { useBaseData } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useBaseData";
import { useStyleCalculator } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useStyleCalculator";

const FormMP = ({
  gridRow,
  gridColumn,
  gridScale,
  gridPadding,
  MicroCards,
  activatedComponents,
  onActivatedComponents,
  currentIndex,
  data,
  html = false,
  moduleProps = {
    zIndex: 0,
  },
}: FormMPProps<FormMPPropsItem>) => {
  // 基础静态数据获取和定义
  const baseData = useBaseData<
    FormMPPropsItem,
    FormMPProps<FormMPPropsItem>["moduleProps"]
  >({
    gridColumn,
    gridRow,
    gridScale,
    gridPadding,
    data,
    moduleProps,
    minShape: FormMP.minShape,
  });

  // ======================
  // 计算属性
  // ======================

  // 计算样式
  const { width, height } = useStyleCalculator(baseData);

  const handleSetActivatedComponents = (components: ComponentItem[]) => {
    if (onActivatedComponents) {
      onActivatedComponents([...components], currentIndex);
    } else {
      console.error("onActivatedComponents is not defined");
    }
  };

  const [form] = Form.useForm();

    // 从 itemProps 中排除 submitText 属性
  // submitText不是Button自带的属性，故需分离
  const { gridPadding: _gridPadding, ...filteredItemProps } = baseData.data[0].itemProps || {};

  return (
    <Form
      {...filteredItemProps}
      style={{ width, height }}
      name={baseData.data[0].name + "_" + currentIndex}
      initialValues={{ remember: true }}
      autoComplete="off"
      form={form}
    >
      <ContainerPC
        html={html}
        currentIndex={currentIndex}
        gridRow={gridRow}
        gridColumn={gridColumn}
        gridScale={gridScale}
        gridPadding={gridPadding}
        MicroCards={MicroCards}
        activatedComponents={activatedComponents}
        onActivatedComponents={handleSetActivatedComponents}
        moduleProps={{
          zIndex: moduleProps.zIndex,
        }}
      />
    </Form>
  );
};

// 静态方法
FormMP.minShape = () => ({
  minColSpan: 8, // 最小高占格
  minRowSpan: 6, // 最小宽占格
});

export default FormMP;
