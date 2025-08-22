const selfServiceItemListForm = {
  dataList: [
    {
      id: 1,
      itemName: "Input",
      url: "Form/Input",
      props: {
        gridColumn: 6,
        gridRow: 2,
        moduleProps: {
          label: "标题",
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
  ],
};
export default selfServiceItemListForm;
