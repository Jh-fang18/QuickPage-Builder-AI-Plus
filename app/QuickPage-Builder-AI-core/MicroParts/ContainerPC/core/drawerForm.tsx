import { useState, useRef } from "react";
import { Form, message, Button } from "antd";
import {
  DrawerForm,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormDigit,
  ProCard,
  ModalForm,
  ProFormRadio,
  ProFormDependency,
} from "@ant-design/pro-components";

// 导入类型
import type { SupportedDataTypes, BaseDataItem } from "../../types/common";
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
const extractEventProps = (itemProps: SupportedDataTypes["itemProps"] = {}) => {
  //console.log("itemProps", itemProps);
  const eventProps: Record<string, any> = {};
  const normalProps: Record<string, any> = {};

  Object.keys(itemProps).forEach((key) => {
    if (key.startsWith("on")) {
      eventProps[key] = itemProps[key as keyof SupportedDataTypes["itemProps"]];
    } else if (key !== "eventsList") {
      normalProps[key] =
        itemProps[key as keyof SupportedDataTypes["itemProps"]];
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
  const [modalVisit, setModalVisit] = useState(false);
  const [eventsList, setEventsList] = useState<
    Array<{ id: number; actionType: string; selectedEvent: string }>
  >([...(props.component.props.data?.[0]?.itemProps?.eventsList || [])]);

  // 非响应式数据
  const modalFormRef = useRef<any>(null);

  // 存储原始数据，用于取消操作
  const [originalData, setOriginalData] = useState({
    ...(props.component.props.data?.[0] || {}),
  });

  // 通用数据处理函数
  const processData = (values: any): SupportedDataTypes => {
    // 从表单数据中排除 eventsList，因为它不应该从表单数据中转换
    const { eventsList: _, ...formValues } = values;
    const nestedItemProps = convertFlatToNested(formValues);
    
    // 确保 eventsList 不会被包含在转换后的数据中
    const { eventsList: __, ...cleanItemProps } = nestedItemProps;
    
    const _data = {
      ...originalData,
      itemProps: cleanItemProps,
    };
    if (!validateDataType(_data)) {
      throw new Error("Invalid data type");
    }

    return _data;
  };

  // 更新组件数据的公共函数
  const updateComponentData = (formattedData: SupportedDataTypes) => {
    // 从 formattedData.itemProps 中排除 eventsList，因为它不应该从表单数据中转换
    const { eventsList: _, ...cleanItemProps } = formattedData.itemProps || {};
    
    // 构建最终的 itemProps，包含 eventsList（如果存在）
    const finalItemProps: any = {
      ...cleanItemProps,
    };

    // 当name在formattedData中时，可以确保 formattedData 是 FormMPDataItem 类型且有 eventsList 属性
    if (
      "name" in formattedData &&
      eventsList.length > 0
    ) {
      // 从 state 中获取 eventsList 并添加到 itemProps 中
      finalItemProps.eventsList = [...eventsList];
    }
    
    const _formattedData = {
      ...formattedData,
      itemProps: finalItemProps,
    };

    const updatedComponent = {
      ...props.component,
      props: {
        ...props.component?.props,
        data: [
          {
            ...originalData,
            itemProps: {
              ...originalData?.itemProps,
              ..._formattedData.itemProps,
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
    console.log("Formatted Data:", originalData);
  };

  // 仅更新父组件数据，不修改 originalData
  const updateParentComponentData = (formattedData: SupportedDataTypes) => {
    // 从 formattedData.itemProps 中排除 eventsList，因为它不应该被传递到 DOM
    const { eventsList: _, ...cleanItemProps } = formattedData.itemProps || {};
    
    const updatedComponent = {
      ...props.component,
      props: {
        ...props.component?.props,
        data: [
          {
            ...originalData,
            itemProps: {
              ...originalData?.itemProps,
              ...cleanItemProps,
              // 保留原有的 eventsList（如果存在）
              ...(originalData?.itemProps?.eventsList && {
                eventsList: originalData.itemProps.eventsList,
              }),
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
    // 复原eventsList
    setEventsList(originalData.itemProps?.eventsList || []);

    // 复原activatedComponent
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
                    {Object.entries(normalProps || {}).map(([key, value]) =>
                      renderFormItem(key, value)
                    )}
                  </ProForm.Group>
                ),
              },
              {
                label: `事件`,
                key: "tab2",
                children: (
                  <>
                    {Object.keys(eventProps).length > 0 ? (
                      <ProForm.Group>
                        <Button
                          type="primary"
                          onClick={() => {
                            // 打开模态框前重置表单
                            if (modalFormRef.current) {
                              modalFormRef.current.resetFields();
                            }
                            setModalVisit(true);
                          }}
                        >
                          新建
                        </Button>

                        {/* 事件列表展示 */}
                        {eventsList.length > 0 && (
                          <div style={{ marginTop: "20px", width: "100%" }}>
                            <h4 style={{ marginBottom: "10px" }}>已配置的事件:</h4>
                            {eventsList.map((event, index) => (
                              <div
                                key={event.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "8px",
                                  border: "1px solid #d9d9d9",
                                  borderRadius: "4px",
                                  marginBottom: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    height: "26px",
                                    lineHeight: "26px",
                                    padding: "0 5px",
                                  }}
                                >
                                  <strong>类型:</strong> {event.actionType}
                                  {" - "}
                                  <strong>名称:</strong> {event.selectedEvent}
                                </div>
                                <Button
                                  type="text"
                                  icon={<span>—</span>}
                                  onClick={() => {
                                    setEventsList((prev) =>
                                      prev.filter((_, i) => i !== index)
                                    );
                                  }}
                                  danger
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 新建事件对话框 */}
                        <ModalForm
                          formRef={modalFormRef}
                          title="配置事件"
                          open={modalVisit}
                          onFinish={async (values) => {
                              // 如果是submitData动作类型，调用Coze工作流API
                              // if (values.actionType === "submitData") {
                              //   try {
                              //     // 动态导入Coze服务以避免不必要的加载
                              //     const { submitDataToDatabase } = await import('./api/cozeService');
                                  
                              //     // 调用Coze工作流API
                              //     const result = await submitDataToDatabase(
                              //       values.workflowId,
                              //       values.apiKey,
                              //       values.databaseUrl,
                              //       values
                              //     );
                                  
                              //     if (!result.success) {
                              //       console.error("提交数据到工作流失败:", result.error);
                              //       // 可以添加错误提示给用户
                              //     } else {
                              //       console.log("数据提交成功:", result.data);
                              //     }
                              //   } catch (error) {
                              //     console.error("提交数据到工作流失败:", error);
                              //     // 可以添加错误提示给用户
                              //   }
                              // }
                              
                              // 将配置的事件添加到事件列表中
                              setEventsList((prev) => [
                                ...prev,
                                {
                                  id: Date.now(), // 简单的ID生成方式
                                  actionType: values.actionType,
                                  selectedEvent: values.selectedEvent,
                                  // 保存submitData相关的配置
                                  ...(values.actionType === "submitData" && {
                                    workflowId: values.workflowId,
                                    apiKey: values.apiKey,
                                    databaseUrl: values.databaseUrl
                                  })
                                },
                              ]);
                              setModalVisit(false);
                              return true;
                            }}
                          onOpenChange={(visible) => {
                            setModalVisit(visible);
                            // 当模态框关闭时重置表单
                            if (!visible && modalFormRef.current) {
                              modalFormRef.current.resetFields();
                            }
                          }}
                        >
                          <ProFormSelect
                            name="selectedEvent"
                            label="选择事件"
                            options={Object.keys(eventProps).map(
                              (eventName) => ({
                                label: eventName,
                                value: eventName,
                              })
                            )}
                            placeholder="请选择事件"
                            width="md"
                          />

                          <ProFormSelect
                            name="actionType"
                            label="执行动作"
                            options={[
                              { label: "提交数据", value: "submitData" },
                              { label: "页面跳转", value: "pageRedirect" },
                              { label: "展示提示信息", value: "showMessage" },
                              { label: "控制组件", value: "controlComponent" },
                              {
                                label: "界面变量赋值",
                                value: "assignVariable",
                              },
                            ]}
                            placeholder="请选择执行动作"
                            width="md"
                            rules={[
                              { required: true, message: "请选择执行动作" },
                            ]}
                          />

                          {/* 根据选择的动作显示不同的配置项 */}
                          <ProFormDependency name={["actionType"]}>
                            {({ actionType }: any) => {
                              if (actionType === "showMessage") {
                                return (
                                  <ProFormText
                                    name="messageContent"
                                    label="提示信息内容"
                                    width="md"
                                    rules={[
                                      {
                                        required: true,
                                        message: "请输入提示信息内容",
                                      },
                                    ]}
                                  />
                                );
                              }
                              if (actionType === "pageRedirect") {
                                return (
                                  <ProFormText
                                    name="redirectUrl"
                                    label="跳转地址"
                                    width="md"
                                    rules={[
                                      {
                                        required: true,
                                        message: "请输入跳转地址",
                                      },
                                    ]}
                                  />
                                );
                              }
                              if (actionType === "controlComponent") {
                                return (
                                  <ProFormText
                                    name="componentId"
                                    label="组件ID"
                                    width="md"
                                    rules={[
                                      {
                                        required: true,
                                        message: "请输入组件ID",
                                      },
                                    ]}
                                  />
                                );
                              }
                              if (actionType === "assignVariable") {
                                  return (
                                    <>
                                      <ProFormText
                                        name="variableName"
                                        label="变量名"
                                        width="md"
                                        rules={[
                                          {
                                            required: true,
                                            message: "请输入变量名",
                                          },
                                        ]}
                                      />
                                      <ProFormRadio.Group
                                        name="variableValue"
                                        label="变量值"
                                        options={[
                                          { label: "固定值", value: "fixed" },
                                          { label: "表单值", value: "formValue" },
                                        ]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "请选择变量值类型",
                                          },
                                        ]}
                                      />
                                    </>
                                  );
                                }
                                if (actionType === "submitData") {
                                  return (
                                    <>
                                      <ProFormText
                                        name="workflowId"
                                        label="工作流ID"
                                        width="md"
                                        placeholder="请输入Coze工作流ID"
                                        rules={[
                                          {
                                            required: true,
                                            message: "请输入工作流ID",
                                          },
                                        ]}
                                      />
                                      <ProFormText
                                        name="apiKey"
                                        label="API密钥"
                                        width="md"
                                        placeholder="请输入Coze API密钥"
                                        rules={[
                                          {
                                            required: true,
                                            message: "请输入API密钥",
                                          },
                                        ]}
                                      />
                                      <ProFormText
                                        name="databaseUrl"
                                        label="数据库地址"
                                        width="md"
                                        placeholder="请输入数据库连接地址"
                                        rules={[
                                          {
                                            required: true,
                                            message: "请输入数据库地址",
                                          },
                                        ]}
                                      />
                                    </>
                                  );
                                }
                                return null;
                            }}
                          </ProFormDependency>
                        </ModalForm>
                      </ProForm.Group>
                    ) : (
                      <div>暂无事件属性</div>
                    )}
                  </>
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
