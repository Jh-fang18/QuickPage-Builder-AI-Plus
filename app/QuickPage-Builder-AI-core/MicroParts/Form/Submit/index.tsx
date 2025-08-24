// 导入已有组件
import { Form, Button } from "antd";

// 导入自有组件
import { useBaseData } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useBaseData";
import { useStyleCalculator } from "@/app/QuickPage-Builder-AI-core/lib/hooks/useStyleCalculator";

// 导入类型
import {
  SubmitMPProps,
  SubmitDataItem,
} from "@/app/QuickPage-Builder-AI-core/MicroParts/types/common";

const SubmitMP = ({
  currentIndex,
  gridColumn,
  gridRow,
  gridScale,
  gridPadding,
  data,
  moduleProps,
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

  return (
    <Form.Item label={null} style={{ width, height, margin: 0 }}>
      <Button type="primary" htmlType="submit" block={true}>
        提交
      </Button>
    </Form.Item>
  );
};

// 静态方法
SubmitMP.minShape = () => ({
  minColSpan: 2, // 最小高占格
  minRowSpan: 1, // 最小宽占格
});

export default SubmitMP;
