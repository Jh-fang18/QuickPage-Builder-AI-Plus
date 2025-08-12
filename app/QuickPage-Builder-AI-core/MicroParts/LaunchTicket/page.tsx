import LaunchTicket from "./index";

export default function Page() {
  return (
    <LaunchTicket
      gridRow={16}
      gridColumn={12}
      gridScale={36}
      gridPadding={24}
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
