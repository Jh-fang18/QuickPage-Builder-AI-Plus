import {
  DrawerForm,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormDigit,
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

// 递归渲染函数
const renderFormItem = (
  key: string,
  value: any,
  path: string = key
): React.ReactNode => {
  // 处理对象类型
  if (
    value !== null &&
    value !== undefined &&
    Object.prototype.toString.call(value) === "[object Object]"
  ) {
    return (
      <ProForm.Group
        title={key}
        style={{
          border: "1px dashed #979797",
          padding: "10px",
          marginBottom: "24px",
          borderRadius: 8,
        }}
      >
        {Object.entries(value).map(([subKey, subValue]) => {
          const subPath = `${path}.${subKey}`;
          // 传递父级键名给子级
          return renderFormItem(`${key}.${subKey}`, subValue, subPath);
        })}
      </ProForm.Group>
    );
  }
  // 处理数组类型
  else if (Array.isArray(value)) {
    return (
      <ProForm.Group>
        {value.map((item, index) => {
          const subPath = `${path}[${index}]`;
          // 如果数组元素是对象或数组，继续递归
          if (
            item !== null &&
            item !== undefined &&
            (typeof item === "object" || Array.isArray(item))
          ) {
            return renderFormItem(`${key}[${index}]`, item, subPath);
          } else {
            // 如果数组元素是基本类型，直接显示
            return renderBasicFormItem(`${key}[${index}]`, item, subPath);
          }
        })}
      </ProForm.Group>
    );
  }
  // 处理基本类型
  else {
    return renderBasicFormItem(key, value, path);
  }
};

// 渲染基本表单项目
const renderBasicFormItem = (key: string, value: any, path: string) => {
  // 检查值是否为数字类型
  if (typeof value === "number") {
    return (
      <ProFormDigit
        key={key}
        name={key}
        width="md"
        label={path}
        initialValue={value}
        placeholder={`请输入${path}`}
      />
    );
  }
  // 检查值是否为布尔类型
  else if (typeof value === "boolean") {
    return (
      <ProFormSelect
        key={key}
        name={key}
        width="md"
        label={path}
        initialValue={value}
        options={[
          { label: "True", value: true },
          { label: "False", value: false },
        ]}
        placeholder={`请选择${path}`}
      />
    );
  }
  // 默认为Text格式
  else {
    return (
      <ProFormText
        key={key}
        name={key}
        width="md"
        label={path}
        initialValue={value}
        placeholder={`请输入${path}`}
      />
    );
  }
};

// 转换扁平化的表单数据回嵌套对象结构
const convertFlatToNested = (flatObj: Record<string, any>) => {
  const nestedObj: Record<string, any> = {};

  // 先处理数组表示法的嵌套属性，如 rules[0].required
  // 正则表达式 /^([a-zA-Z0-9_]+)\[(\d+)\](.*)$/ 的匹配结果：
  // match[0]: 完整匹配的字符串，如 'rules[0].required'
  // match[1]: 数组名称，如 'rules'
  // match[2]: 数组索引，如 '0'
  // match[3]: 子键名，如 '.required' 或 ''
  const arrayKeys: Record<string, any> = {};
  Object.keys(flatObj).forEach((key) => {
    if (key.includes("[")) {
      const match = key.match(/^([a-zA-Z0-9_]+)\[(\d+)\](.*)$/);
      if (match) {
        const arrayName = match[1]; // 数组名称，如 'rules'
        const index = parseInt(match[2], 10); // 数组索引，如 0
        const subKey = match[3].startsWith(".")
          ? match[3].substring(1)
          : match[3]; // 子键名，如 'required'

        if (!arrayKeys[arrayName]) {
          arrayKeys[arrayName] = {};
        }
        if (!arrayKeys[arrayName][index]) {
          arrayKeys[arrayName][index] = {};
        }

        if (subKey) {
          // 递归构建嵌套对象
          const parts = subKey.split(".");
          let current = arrayKeys[arrayName][index];
          for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in current)) {
              current[parts[i]] = {};
            }
            current = current[parts[i]];
          }
          current[parts[parts.length - 1]] = flatObj[key];
        } else {
          arrayKeys[arrayName][index] = flatObj[key];
        }
      }
    }
  });

  // 将处理后的数组属性合并到nestedObj
  Object.keys(arrayKeys).forEach((arrayName) => {
    nestedObj[arrayName] = [];
    Object.keys(arrayKeys[arrayName])
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((index) => {
        (nestedObj[arrayName] as any[]).push(arrayKeys[arrayName][index]);
      });
  });

  // 处理点表示法的嵌套属性，如 labelCol.span
  Object.keys(flatObj).forEach((key) => {
    if (key.includes(".") && !key.includes("[")) {
      const parts = key.split(".");
      let current = nestedObj;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!(parts[i] in current)) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = flatObj[key];
    }
    // 处理普通属性
    else if (!key.includes("[") && !key.includes(".")) {
      nestedObj[key] = flatObj[key];
    }
  });

  return nestedObj;
};

export default (props: {
  index: number;
  component: ComponentItem<InputDataItem>;
  onCurrentActivatedComponent: ( // 传递给父组件，更新父组件的激活微件列表
    component: ComponentItem,
    index: number
  ) => void;
}) => {
  const [form] = Form.useForm<{ name: string; company: string }>();

  return (
    <DrawerForm<{
      name: string;
      company: string;
    }>
      title={props.component.title}
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

        // 将提交的values转换为InputDataItem格式
        // 先获取原始数据，如果没有则创建一个空的InputDataItem结构
        const originalData = props.component.props.data?.[0] || {
          nameType: "",
          nameValue: "",
          itemProps: {},
        };

        const formattedData: InputDataItem = {
          nameType: originalData.nameType,
          nameValue: originalData.nameValue,
          itemProps: convertFlatToNested(values),
        };

        props.onCurrentActivatedComponent(
          {
            ...props.component,
            props: {
              ...props.component.props,
              data: [formattedData],
            },
          },
          props.index
        );
        console.log("Formatted Data:", formattedData);
        message.success("提交成功");
        // 不返回不会关闭弹框
        return true;
      }}
    >
      <ProForm.Group>
        {Object.entries(props.component.props.data?.[0]?.itemProps || {}).map(
          ([key, value]) => renderFormItem(key, value)
        )}
      </ProForm.Group>
    </DrawerForm>
  );
};
