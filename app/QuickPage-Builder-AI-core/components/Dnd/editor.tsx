"use client";

// 导入库
import { useState, useEffect, useRef, Suspense } from "react";
import { ContainerOutlined, DesktopOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Spin, Layout, Menu, message } from "antd";
const { Sider, Content } = Layout;
type MenuItem = Required<MenuProps>["items"][number];

// 导入样式
import "./editor.module.css";

// 导入自定义组件
import * as MicroCards from "../../MicroParts/index";
import CoreComponent from "./Core/index";
import EditContext from "./context";

// 导入类型
import type { ComponentItem } from "../../types/common";
import type { MicroCardsType } from "../../types/common";

// 导入数据
import { fetchComponentData } from "../../lib/components/dnd";

export default function Editor({
  gridRow,
  gridColumn,
  gridScale,
  gridPadding,
  microParts,
}: {
  gridRow?: number;
  gridColumn?: number;
  gridScale?: number;
  gridPadding?: number;
  microParts?: MicroCardsType;
}) {
  // 合并微件
  const _MicroCards: MicroCardsType = {
    ...MicroCards,
    ...microParts,
  };

  // ======================
  // 响应式变量
  // ======================

  const [_gridRow, setGridRow] = useState<number>(gridRow || 36);
  const [_gridColumn, setGridColumn] = useState<number>(gridColumn || 24);
  const [components, setComponents] = useState<ComponentItem[][]>([]);
  const [activatedComponents, setActivatedComponents] = useState<
    ComponentItem[]
  >([]);
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState(false);
  const [tempId, setTempId] = useState<string>("");
  const [terminalType, setTerminalType] = useState<number>(0);

  // ======================
  // 非响应式变量
  // ======================
  const _gridScale = gridScale || 30;
  const _gridPadding = gridPadding || 20;
  const contentIdRef = useRef<number>(0);
  const oldContentRef = useRef<string>("");

  const DynamicComponents = [
    {
      Name: "index",
      Props: {
        terminalType,
        gridRow: _gridRow,
        gridColumn: _gridColumn,
        gridScale: _gridScale,
        gridPadding: _gridPadding,
        MicroCards: _MicroCards,
      },
    },
  ];

  //console.log(DynamicComponents[0].Props.MicroCards);

  // 页面挂在后, 获取微件数据
  useEffect(() => {
    // 根据微件数量设置菜单，并控制编辑区域高度
    fetchComponentData(
      _MicroCards,
      _gridRow,
      Number(tempId),
      terminalType
    ).then((res) => {
      //console.log("res", res);

      setActivatedComponents(res.activatedComponents);
      setGridRow(res.gridRow);
      setComponents(res.components);
      contentIdRef.current = res.contentId;
      oldContentRef.current = res.oldContent;

      setMenuData([
        {
          key: "1",
          label: "其他类",
          icon: <DesktopOutlined />,
          children:
            (res.components[0] || []).map((item, index) => ({
              key: `0-${item.menuKey}_${index}`,
              label: item.title,
            })) || [],
        },
        {
          key: "2",
          label: "容器类",
          icon: <ContainerOutlined />,
          children:
            (res.components[1] || []).map((item, index) => ({
              key: `1-${item.menuKey}_${index}`,
              label: item.title,
            })) || [],
        },
      ]);
    });
  }, []);

  /**
   * 设置已激活模板信息存入sessionStorage
   * @param _tempId 模板id
   * @param _activatedComponents 已激活组件
   * @param _contentId 内容id
   * @param _oldContent 旧内容
   */
  const setWorkbenchData = (
    _tempId: string,
    _activatedComponents: ComponentItem[],
    _contentId: number,
    _oldContent: string
  ) => {
    const _workbenchData = {
      activatedComponents: _activatedComponents,
      contentId: _contentId,
      oldContent: _oldContent,
    };

    const workbenchData =
      JSON.parse(
        window.sessionStorage.getItem("activatedComponents") || "{}"
      ) || {};

    if (_tempId) workbenchData[_tempId] = _workbenchData;
    else workbenchData["tmp"] = _workbenchData;

    window.sessionStorage.setItem(
      "activatedComponents",
      JSON.stringify(workbenchData)
    );
  };

  /**
   * 添加组件到画布
   * 注意: 直接修改外部变量state.activatedComponents
   * @param component 要添加的组件
   */
  const addComponent = (component: ComponentItem) => {
    if (!component) return;
    // console.log("component", component);
    setActivatedComponents([...activatedComponents, component]);
  };

  // 点击添加微件进入画布
  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    // console.log("key", key);

    if (typeof key !== "string") {
      console.error("Invalid eventKey type:", key);
      return;
    }
    if (key === null) return;

    const [classIdStr, componentInfo] = key.split("-");
    const [componentKey, indexStr] = componentInfo.split("_");
    if (!componentKey) return; // 没有componentKey，直接返回

    // 类型转换
    const _key = componentKey || "";
    const _classId = Number(classIdStr) || 0;
    const _index = Number(indexStr) || 0;

    const _component = {
      ...components[_classId][_index],
      // 生成唯一key，格式: 组件key_时间戳_随机字符串
      key: `${_key}_${
        Date.now().toString(36) + Math.random().toString(36).substring(2)
      }`,
      menuKey: _key,
    };
    _component.width = _component.props?.width || 12;
    _component.height = _component.props?.height || 12;

    if (activatedComponents && activatedComponents.length > 0) {
      // 画布不为空
      // 获取最后一个组件的高度和ccs
      const { ccs } = activatedComponents[activatedComponents.length - 1];
      
      // 分割ccs字符串并转换为数字数组, 格式: [x, y, height, width], 相对grid-area: [grid-row-start / grid-column-start / grid-row-end / grid-column-end]
      const aCss = ccs.split("/").map(Number);

      if (
        // 判断在最后一个微件的同一行里是否有位置可以插入新微件
        aCss[0] + _component.height <= _gridRow + 1 && // 高度和小于画布
        aCss[3] + _component.width <= _gridColumn + 1 // 宽度和小于画布
      ) {
        _component.ccs =
          aCss[0] +
          "/" +
          aCss[3] +
          "/" +
          (aCss[0] + _component.height) +
          "/" +
          (aCss[3] + _component.width);
      } else if (
        // 判断在最后一个微件的同一行后是否有位置可以插入新微件
        aCss[0] + _component.height <= _gridRow + 1 &&
        aCss[3] + _component.width > _gridColumn + 1
      ) {
        // 找到最后行中组件的最大高度
        const maxHeight = activatedComponents.reduce(
          (prev: number, curr: ComponentItem) => {
            if (!curr.ccs) return prev;
            return Math.max(prev, Number(curr.ccs.split("/")[2]));
          },
          0
        );

        _component.ccs =
          maxHeight +
          "/1" +
          "/" +
          (maxHeight + _component.height) +
          "/" +
          (_component.width + 1);
      } else {
        message.warning("已没有位置可以插入新组件！");
        return;
      }
    } // 画布为空，直接插入第一个组件
    else
      _component.ccs =
        "1/1/" + (_component.height + 1) + "/" + (_component.width + 1);

    // 计算组件的rowIndex，实际为插入元素个数-1，故与已激活组件为添加自身前数组长度相同
    _component.rowIndex = activatedComponents.length;

    //console.log(_component);
    addComponent(_component); // 添加组件到画布
    setWorkbenchData(
      tempId,
      activatedComponents,
      contentIdRef.current,
      oldContentRef.current
    ); // 保存已激活模板信息到sessionStorage

    //console.log(activatedComponents);
  };

  return (
    <Layout>
      <Spin tip="loading" spinning={loading}>
        <Layout style={{ background: "#fff" }}>
          <Sider>
            <div className="title">微件列表</div>
            <Menu
              defaultOpenKeys={["1", "2"]}
              mode="inline"
              inlineCollapsed={collapsed}
              items={menuData}
              onClick={onMenuClick}
            />
          </Sider>
          <Content>
            <Suspense fallback={<h2>Loading...</h2>}>
              <EditContext.Provider
                value={{ activatedComponents, setActivatedComponents }}
              >
                <CoreComponent {...(DynamicComponents[0].Props as any)} />
              </EditContext.Provider>
            </Suspense>
          </Content>
        </Layout>
      </Spin>
    </Layout>
  );
}
