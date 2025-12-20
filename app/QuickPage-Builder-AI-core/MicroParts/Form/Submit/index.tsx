// 导入已有组件
import { Form, Button } from "antd";

// 导入自有组件
import { useBaseData } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useBaseData";
import { useStyleCalculator } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useStyleCalculator";

// 导入类型
import type {
  SubmitMPProps,
  SubmitDataItem,
} from "../../types/common";

const SubmitMP = ({
  gridColumn,
  gridRow,
  gridScale,
  gridPadding,
  moduleProps,
  data,
}: SubmitMPProps) => {
  // ======================
  // 私有响应状态
  // ======================

  // 基础静态数据获取和定义
  const baseData = useBaseData<SubmitDataItem, SubmitMPProps["moduleProps"]>({
    gridColumn,
    gridRow,
    gridScale,
    gridPadding,
    data,
    moduleProps,
    minShape: SubmitMP.minShape,
  });

  // ======================
  // 计算属性
  // ======================

  // 计算样式
  const { width, height } = useStyleCalculator(baseData);

  // ======================
  // 副作用
  // ======================

  // 从 itemProps 中排除 submitText 属性
  // submitText不是Button自带的属性，故需分离
  const { submitText, eventsList, ...filteredItemProps } = baseData.data[0].itemProps || {};

  return (
    <Form.Item label={null} style={{ width, height, margin: 0 }}>
      <Button
        {...filteredItemProps}
        type="primary"
        htmlType="submit"
        block={true}
      >
        {submitText || "提交"}
      </Button>
    </Form.Item>
  );
};

// 静态方法
SubmitMP.minShape = () => ({
  minColSpan: 3, // 最小高占格
  minRowSpan: 1, // 最小宽占格
});

export default SubmitMP;
