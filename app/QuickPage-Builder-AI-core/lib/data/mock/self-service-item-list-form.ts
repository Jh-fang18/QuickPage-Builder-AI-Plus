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
        data: [
          {
            id: 1,
            label: "标题",
            labelCol: { span: 8 },
            inputType: "text",
            value: "",
            placeholder: "请输入",
            validateRules: [{ required: true, message: "请输入" }],
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
            id: 1,
            submitText: "提交",
          },
        ],
      },
    },
  ],
};
export default selfServiceItemListForm;
