const selfServiceItemList = {
  dataList: [
    {
      id: 1,
      itemName: "Bottomfiling",
      url: "Bottomfiling",
      props: {},
    },
    {
      id: 2,
      itemName: "SmallBoard",
      url: "SmallBoard",
      props: {},
    },
    {
      id: 3,
      itemName: "CommonFunctions",
      url: "CommonFunctions",
      props: {},
    },
    {
      id: 4,
      itemName: "LaunchTicket",
      url: "LaunchTicket",
      props: {
        gridColumn: 8,
        gridRow: 6,
        moduleProps: {
          title: "启动票",
        },
        data: [
          {
            id: 1,
            showName: "启动票",
          },
        ],
      },
    },
    {
      id: 5,
      itemName: "ProcessingWorkOrders",
      url: "ProcessingWorkOrders",
      props: {},
    },
  ],
};
export default selfServiceItemList;
