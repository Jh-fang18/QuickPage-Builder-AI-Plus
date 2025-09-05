// 导入类型
import { InputDataItem } from "@/app/QuickPage-Builder-AI-core/MicroParts/types/common";

const selfServiceItemListForm = {
  dataList: [
    {
      id: 1,
      itemName: "Input",
      url: "InputMP",
      props: {
        moduleProps: {
          morph: {
            up: false,
            down: false,
            left: true,
            right: true,
          },
        },
        data: <InputDataItem[]>[
          {
            nameType: "text",
            nameValue: "string",
            itemProps: {
              label: "标题",
              labelCol: { span: 8, offset: 0 },
              initialValue: "text",
              rules: [{ required: true, message: "请输入" }],
            },
          },
        ],
      },
    },
    {
      id: 2,
      itemName: "Submit",
      url: "SubmitMP",
      props: {
        moduleProps: {
          morph: {
            up: false,
            down: false,
            left: true,
            right: true,
          },
        },
        data: [
          {
            itemProps: {
              submitText: "提交3",
            },
          },
        ],
      },
    },
  ],
};
export default selfServiceItemListForm;
