import InputMP from "./index";

export default function Page() {
  return (
    <InputMP
      gridColumn={6}
      gridRow={2}
      gridScale={36}
      gridPadding={24}
      moduleProps={{
        label: "标题",
        labelCol: {
          span: 6,
        },
      }}
      data={[
        {
          id: 1,
          inputType: "text",
          value: "",
          placeholder: "请输入",
          validateRules: [{ required: true, message: "请输入" }],
        },
      ]}
    />
  );
}
