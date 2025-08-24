const selfServiceItemListForm = {
  dataList: [
    {
      id: 1,
      itemName: "Input",
      url: "InputMP",
      props: {
        gridColumn: 6,
        moduleProps: {
          label: "标题",
          labelCol: { span: 8 },
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
          label: "提交",
        },
      },
    },
  ],
};
export default selfServiceItemListForm;
