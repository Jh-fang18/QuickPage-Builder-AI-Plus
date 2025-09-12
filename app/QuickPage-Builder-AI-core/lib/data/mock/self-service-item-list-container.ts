const selfServiceItemListContainer = {
  dataList: [
    {
      id: 1,
      itemName: "Container",
      url: "ContainerPC",
      props: {
        gridColumn: 16,
        gridRow: 12,
        activatedComponents: [],
        moduleProps: {
          morph: {
            up: true,
            down: true,
            left: true,
            right: true,
          },
        },
      },
    },
    {
      id: 1,
      itemName: "Form",
      url: "FormMP",
      props: {
        activatedComponents: [],
        moduleProps: {
          morph: {
            up: true,
            down: true,
            left: true,
            right: true,
          },
        },
        data: [
          {
            name: "basic",
            itemProps: {
              gridPadding: 17,
              gridScale: 30,
              eventsList: [],
              onFinish: {
                type: "function",
                name: "onFinish",
                parameters: [
                  { name: "values", type: "object", required: true },
                ],
              },
              onFieldsChange: {
                type: "function",
                name: "onFieldsChange",
                parameters: [
                  { name: "values", type: "object", required: true },
                ],
              },
              onFinishFailed: {
                type: "function",
                name: "onFinishFailed",
                parameters: [
                  { name: "values", type: "object", required: true },
                ],
              },
              onValuesChange: {
                type: "function",
                name: "onValuesChange",
                parameters: [
                  { name: "values", type: "object", required: true },
                ],
              },
            },
          },
        ],
      },
    },
  ],
};
export default selfServiceItemListContainer;
