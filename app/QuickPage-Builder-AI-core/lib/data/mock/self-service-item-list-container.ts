import type { FormMPDataItem } from "../../../MicroParts/types/common";

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
              onFinish: {
                type: "function",
              },
              onFieldsChange: {
                type: "function",
              },
              onFinishFailed: {
                type: "function",
              },
              onValuesChange: {
                type: "function",
              },
            },
          },
        ],
      },
    },
  ],
};
export default selfServiceItemListContainer;
