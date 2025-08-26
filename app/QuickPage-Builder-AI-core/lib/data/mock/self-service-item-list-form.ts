const selfServiceItemListForm = {
  dataList: [
    {
      id: 1,
      itemName: "Input",
      url: "InputMP",
      props: {
        moduleProps: {
          label: "标题",
          labelCol: { span: 8 },
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
          submitText: "提交",
          morph: {
            up: false,
            down: false,
            left: true,
            right: true,
          },
        },
      },
    },
  ],
};
export default selfServiceItemListForm;
