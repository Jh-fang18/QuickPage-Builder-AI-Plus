import { useState } from "react";

import {
  DrawerForm,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormDigit,
  ProCard,
} from "@ant-design/pro-components";
import { Form, message, Button } from "antd";

// 导入类型
import type { SupportedDataTypes } from "../../types/common";
import type { ComponentItem } from "../../../types/common";

const waitTime = (time: number = 50) => {
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
          return renderFormItem(`${subKey}`, subValue, subPath);
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
        key={path}
        name={path}
        width="md"
        label={key}
        initialValue={value}
        placeholder={`请输入${key}`}
      />
    );
  }
  // 检查值是否为布尔类型
  else if (typeof value === "boolean") {
    return (
      <ProFormSelect
        key={path}
        name={path}
        width="md"
        label={key}
        initialValue={value}
        options={[
          { label: "True", value: true },
          { label: "False", value: false },
        ]}
        placeholder={`请选择${key}`}
      />
    );
  }
  // 默认为Text格式
  else {
    return (
      <ProFormText
        key={path}
        name={path}
        width="md"
        label={key}
        initialValue={value}
        placeholder={`请输入${key}`}
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
  // 保持原始数组索引顺序
  Object.keys(arrayKeys).forEach((arrayName) => {
    nestedObj[arrayName] = [];
    Object.keys(arrayKeys[arrayName])
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((index) => {
        // 确保数组索引是连续的
        while (nestedObj[arrayName].length <= parseInt(index)) {
          nestedObj[arrayName].push(undefined);
        }
        nestedObj[arrayName][parseInt(index)] = arrayKeys[arrayName][index];
      });
  });

  // 处理点表示法的嵌套属性，如 labelCol.span
  // 保持属性顺序，先处理嵌套属性，再处理普通属性
  Object.keys(flatObj).forEach((key) => {
    const value = flatObj[key];
    if (key.includes(".") && !key.includes("[")) {
      const parts = key.split(".");
      let current = nestedObj;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!(parts[i] in current)) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = value;
    }
    // 处理普通属性
    else if (!key.includes("[") && !key.includes(".")) {
      nestedObj[key] = value;
    }
  });

  return nestedObj;
};

// 将嵌套对象结构扁平化为表单key值
const convertNestedToFlat = (nestedObj: Record<string, any>, prefix = "") => {
  const flatObj: Record<string, any> = {};

  Object.keys(nestedObj).forEach((key) => {
    const value = nestedObj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (
      value !== null &&
      value !== undefined &&
      Object.prototype.toString.call(value) === "[object Object]"
    ) {
      // 递归处理嵌套对象
      Object.assign(flatObj, convertNestedToFlat(value, newKey));
    } else if (Array.isArray(value)) {
      // 处理数组
      value.forEach((item, index) => {
        const arrayKey = `${newKey}[${index}]`;
        if (
          item !== null &&
          item !== undefined &&
          (typeof item === "object" || Array.isArray(item))
        ) {
          // 递归处理数组中的对象或数组
          Object.assign(flatObj, convertNestedToFlat(item, arrayKey));
        } else {
          // 数组中的基本类型
          flatObj[arrayKey] = item;
        }
      });
    } else {
      // 基本类型
      flatObj[newKey] = value;
    }
  });

  return flatObj;
};

// 分离事件属性的函数
const extractEventProps = (itemProps: Record<string, any> = {}) => {
  //console.log("itemProps", itemProps);
  const eventProps: Record<string, any> = {};
  const normalProps: Record<string, any> = {};

  Object.keys(itemProps).forEach((key) => {
    if (key.startsWith("on")) {
      eventProps[key] = itemProps[key];
    } else {
      normalProps[key] = itemProps[key];
    }
  });

  return { eventProps, normalProps };
};

// 更严格的类型谓词
const validateDataType = (data: any): data is SupportedDataTypes => {
  // 更详细的运行时验证
  if (typeof data !== "object" || data === null) {
    console.warn("validateDataType: data is not an object or is null");
    return false;
  }

  // 检查必需的结构
  const hasValidStructure =
    // 必须有 itemProps 属性（可以为 undefined）
    ("itemProps" in data &&
      // 如果 itemProps 存在，必须是对象或 undefined
      (data.itemProps === undefined || typeof data.itemProps === "object")) ||
    // 或者至少有一些其他属性
    Object.keys(data).length > 0;

  return hasValidStructure;
};

export default (props: {
  index: number;
  component: ComponentItem;
  onCurrentActivatedComponent: (
    component: ComponentItem,
    index: number
  ) => void;
}) => {
  const [tab, setTab] = useState("tab1");
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [drawerVisit, setDrawerVisit] = useState(false);

  // 存储原始数据，用于取消操作
  const [originalData, setOriginalData] = useState({
    ...(props.component.props.data?.[0] || {}),
  });

  // 通用数据处理函数
  const processData = (values: any): SupportedDataTypes => {
    const _data = {
      ...originalData,
      itemProps: convertFlatToNested(values),
      d: 1,
    };
    if (!validateDataType(_data)) {
      throw new Error("Invalid data type");
    }

    return _data;
  };

  // 更新组件数据的公共函数
  const updateComponentData = (formattedData: SupportedDataTypes) => {
    const updatedComponent = {
      ...props.component,
      props: {
        ...props.component?.props,
        data: [
          {
            ...originalData,
            itemProps: {
              ...originalData?.itemProps,
              ...formattedData.itemProps,
            },
          },
        ],
      },
    };

    // 更新原始数据状态
    setOriginalData({
      ...updatedComponent.props.data[0],
      itemProps: updatedComponent.props.data[0].itemProps,
    });

    // 确保属性属性不变
    props.onCurrentActivatedComponent(updatedComponent, props.index);
    console.log("Formatted Data:", formattedData);
  };

  // 仅更新父组件数据，不修改 originalData
  const updateParentComponentData = (formattedData: SupportedDataTypes) => {
    const updatedComponent = {
      ...props.component,
      props: {
        ...props.component?.props,
        data: [
          {
            ...originalData,
            itemProps: {
              ...originalData?.itemProps,
              ...formattedData.itemProps,
            },
          },
        ],
      },
    };

    // 不更新原始数据状态
    props.onCurrentActivatedComponent(updatedComponent, props.index);
    console.log("Preview Data:", formattedData);
  };

  // 将原始数据传递给父组件并重置表单
  const resetToOriginalData = () => {
    const originalComponent = {
      ...props.component,
      props: {
        ...props.component?.props,
        data: [
          {
            ...originalData,
          },
        ],
      },
    };

    // 还原原始数据状态，使用扁平化后的数据
    const flatOriginalData = convertNestedToFlat(originalData.itemProps);
    form.setFieldsValue(flatOriginalData);
    props.onCurrentActivatedComponent(originalComponent, props.index);
  };

  // 处理表单提交
  const handleFinish = async (values: any) => {
    try {
      // 原有的提交逻辑保持不变
      await waitTime(1000);

      const formattedData = processData(values);
      updateComponentData(formattedData);

      messageApi.success("提交成功");
      // 不返回不会关闭弹框
      return true;
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "提交失败");
    }
  };

  // 分离事件属性和普通属性
  const itemProps = props.component.props.data?.[0]?.itemProps || {};
  const { eventProps, normalProps } = extractEventProps(itemProps);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDrawerVisit(true);
        }}
      >
        属性
      </button>
      <DrawerForm
        title={props.component.title}
        resize={{
          onResize() {
            console.log("resize!");
          },
          maxWidth: window.innerWidth * 0.8,
          minWidth: 328,
        }}
        layout="horizontal"
        form={form}
        open={drawerVisit}
        onOpenChange={setDrawerVisit}
        autoFocusFirstInput
        drawerProps={{
          destroyOnClose: true,
          styles: {
            mask: {
              background: "none",
            },
            body: {
              padding: 0,
            },
          },
          onClose: () => {
            resetToOriginalData();
          },
        }}
        submitter={{
          resetButtonProps: {
            style: {
              display: "none",
            },
          },
          render: (_, defaultDoms) => {
            return [
              <Button
                key="preview"
                type="primary"
                onClick={async () => {
                  const values = await form.validateFields();
                  const formattedData = processData(values);
                  updateParentComponentData(formattedData);
                }}
              >
                预览
              </Button>,
              <Button
                key="reset"
                onClick={() => {
                  resetToOriginalData();
                }}
              >
                重置
              </Button>,
              ...defaultDoms,
              <Button
                key="cancel"
                onClick={() => {
                  resetToOriginalData();
                  setDrawerVisit(false);
                }}
                style={{ marginRight: 8 }}
              >
                取消
              </Button>,
            ];
          },
        }}
        submitTimeout={1000}
        onFinish={handleFinish}
      >
        <ProCard
          tabs={{
            tabPosition: "top",
            activeKey: tab,
            items: [
              {
                label: `属性`,
                key: "tab1",
                children: (
                  <ProForm.Group>
                    {Object.entries(
                      normalProps || {}
                    ).map(([key, value]) => renderFormItem(key, value))}
                  </ProForm.Group>
                ),
              },
              {
                label: `事件`,
                key: "tab2",
                children: (
                  <ProForm.Group>
                    {Object.keys(eventProps).length > 0 ? (
                      <ProFormSelect
                        name="selectedEvent"
                        label="选择事件"
                        options={Object.keys(eventProps).map((eventName) => ({
                          label: eventName,
                          value: eventName,
                        }))}
                        placeholder="请选择事件"
                        width="md"
                      />
                    ) : (
                      <div>暂无事件属性</div>
                    )}
                  </ProForm.Group>
                ),
              },
            ],
            onChange: (key) => {
              setTab(key);
            },
          }}
        />
      </DrawerForm>
      {contextHolder}
    </>
  );
};
