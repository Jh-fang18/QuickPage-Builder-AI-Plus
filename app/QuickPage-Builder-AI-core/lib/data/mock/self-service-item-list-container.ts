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
            id: 1,
            title: "表单",
            name: "basic",
          },
        ],
      },
    },
  ],
};
export default selfServiceItemListContainer;
