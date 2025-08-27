// 导入样式
import styles from "./styles.module.css";

import { Form } from "antd";

import ContainerPC from "../ContainerPC/index";

import { ComponentItem } from "../../types/common";
import { FormMPProps } from "../types/common";

const FormMP = ({
  currentIndex,
  gridRow,
  gridColumn,
  gridScale,
  gridPadding,
  MicroCards,
  activatedComponents,
  onActivatedComponents,
  moduleProps = {
    zIndex: 0,
    name: "basic",
  },
}: FormMPProps) => {
  const handleSetActivatedComponents = (components: ComponentItem[]) => {
    if (onActivatedComponents) {
      onActivatedComponents([...components], currentIndex);
    } else {
      console.error("onActivatedComponents is not defined");
    }
  };

  return (
    <Form
      style={{ height: "100%" }}
      name={moduleProps.name}
      initialValues={{ remember: true }}
      autoComplete="off"
    >
      <ContainerPC
        html={true}
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
