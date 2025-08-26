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
      },
    },
    {
      id: 1,
      itemName: "Form",
      url: "FormMP",
      props: {
        activatedComponents: [],
        moduleProps: {
          name: "Form",
          morph: {
            up: true,
            down: true,
            left: true,
            right: true,
          },
        },
      },
    },
  ],
};
export default selfServiceItemListContainer;
