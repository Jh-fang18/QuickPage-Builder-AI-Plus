import {
  DrawerForm,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Form, message } from "antd";

import type { ComponentItem } from "../../../types/common";
import type { InputDataItem } from "../../types/common";

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export default (props: { componentData: ComponentItem<InputDataItem> }) => {
  const [form] = Form.useForm<{ name: string; company: string }>();

  return (
    <DrawerForm<{
      name: string;
      company: string;
    }>
      title={props.componentData.title}
      resize={{
        onResize() {
          console.log("resize!");
        },
        maxWidth: window.innerWidth * 0.8,
        minWidth: 300,
      }}
      form={form}
      trigger={<button type="button">属性</button>}
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
        styles: {
          mask: {
            background: "none",
          },
        },
      }}
      submitTimeout={2000}
      onFinish={async (values) => {
        await waitTime(2000);
        console.log(values);
        message.success("提交成功");
        // 不返回不会关闭弹框
        return true;
      }}
    >
      <ProForm.Group>
        {Object.entries(props.componentData.props.data?.[0] || {}).map(
          ([key, value]) => {
            console.log(key, value);
            return (
              <ProFormText
                name={key}
                width="md"
                label={key}
                placeholder={`请输入${key}`}
              />
            );
          }
        )}
        <ProFormText
          name="name"
          width="md"
          label="签约客户名称"
          tooltip="最长为 24 位"
          placeholder="请输入名称"
        />
        <ProFormText
          rules={[
            {
              required: true,
            },
          ]}
          width="md"
          name="company"
          label="我方公司名称"
          placeholder="请输入名称"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          width="md"
          name="contract"
          label="合同名称"
          placeholder="请输入名称"
        />
        <ProFormDateRangePicker name="contractTime" label="合同生效时间" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          options={[
            {
              value: "chapter",
              label: "盖章后生效",
            },
          ]}
          width="xs"
          name="useMode"
          label="合同约定生效方式"
        />
        <ProFormSelect
          width="xs"
          options={[
            {
              value: "time",
              label: "履行完终止",
            },
          ]}
          formItemProps={{
            style: {
              margin: 0,
            },
          }}
          name="unusedMode"
          label="合同约定失效效方式"
        />
      </ProForm.Group>
      <ProFormText width="sm" name="id" label="主合同编号" />
      <ProFormText
        name="project"
        disabled
        label="项目名称"
        initialValue="xxxx项目"
      />
      <ProFormText
        width="xs"
        name="mangerName"
        disabled
        label="商务经理"
        initialValue="启途"
      />
    </DrawerForm>
  );
};
