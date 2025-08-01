import LaunchTicket from "./index";

export default function Page() {
  return (
    <LaunchTicket
      rowSpan={17}
      colSpan={12}
      gridSize={12}
      gridSpace={12}
      title="启动票"
      data={[
        {
          id: 1,
          showName: "已发布",
          explain: "已发布的项目",
          color: "red",
        },
        {
          id: 2,
          showName: "草稿",
          explain: "草稿项目",
          color: "orange",
        },
      ]}
    />
  );
}
