"use client";

// 导入库
import { useState, useEffect, useRef, Suspense } from "react";
import { DndProvider, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ContainerOutlined,
  DesktopOutlined,
  FormOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Spin, Layout, Menu, message, Button } from "antd";
const { Sider, Content, Footer } = Layout;
import '@ant-design/v5-patch-for-react-19';

// 导入样式
import styles from "./editor.module.css";

// 导入自定义组件
import * as MicroCards from "../../MicroParts/index";
import CoreComponent from "./Core/index";
import EditContext from "./context";

// 导入类型
import type { ComponentItem } from "../../types/common";
import type { MicroCardsType } from "../../types/common";
type MenuItem = Required<MenuProps>["items"][number];

// 导入数据
import { fetchComponentData } from "../../lib/data/components/dnd";

export default function Editor({
  gridRow = 36,
  gridColumn = 24,
  gridScale = 34,
  gridPadding = 20,
  microParts,
  tempId = "tmp",
}: {
  gridRow?: number;
  gridColumn?: number;
  gridScale?: number;
  gridPadding?: number;
  microParts?: MicroCardsType;
  tempId?: string;
}) {
  // 合并微件
  const _MicroCards: MicroCardsType = {
    ...MicroCards,
    ...microParts,
  };

  // ======================
  // 响应式变量
  // ======================

  const [_gridRow, setGridRow] = useState<number>(gridRow);
  const [_gridColumn, setGridColumn] = useState<number>(gridColumn);
  const [components, setComponents] = useState<ComponentItem[][]>([]);
  const [activatedComponents, setActivatedComponents] = useState<
    ComponentItem[]
  >([]);
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  // 拖动时的z-index需设置为1，提高目标元素cotainer的层级
  // 不然无法触发目标元素的drop事件
  const [zIndex, setZIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState(false);
  const [terminalType, setTerminalType] = useState<number>(0);

  // ======================
  // 非响应式变量
  // ======================
  const _gridScale = gridScale;
  const _gridPadding = gridPadding;
  const currentActivatedComponentsRef = useRef<ComponentItem[]>([]);
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
        moduleProps: {
          zIndex,
        },
      },
    },
  ];

  const siderStyle: React.CSSProperties = {
    overflow: "auto",
    height: "100vh",
    position: "sticky",
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: "thin",
    scrollbarGutter: "stable",
  };

  /**
   * 可拖动菜单项
   * @param item 微件数据
   */
  const DraggableMenuItem: React.FC<{ item: ComponentItem }> = ({ item }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "MENU_ITEM",
      item: {
        ...item,
        props: {
          ...item.props,
        },
      },
      collect: (monitor) => {
        return {
          isDragging: !!monitor.isDragging(),
        };
      },
    }));

    // 副作用处理，修改父组件的state
    useEffect(() => {
      if (isDragging) setZIndex(1);
      else setZIndex(0);
    }, [isDragging]);

    return (
      <div ref={drag as any} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <span className="pl-2">{item.title}</span>
      </div>
    );
  };

  /**
   * 设置已激活模板信息存入sessionStorage
   * @param _tempId 模板id
   * @param _activatedComponents 已激活组件
   * @param _contentId 内容id
   * @param _oldContent 旧内容
   */
  const setWorkbenchData = (
    activatedComponents: ComponentItem[],
    contentId: number,
    oldContent: string,
    tempId?: string
  ) => {
    // 使用对象属性简写创建新的工作台数据对象
    const _workbenchData = {
      activatedComponents: [...activatedComponents],
      contentId,
      oldContent,
    };

    try {
      // 从 sessionStorage 获取现有数据，使用空值合并运算符处理 null
      const storedData = window.sessionStorage.getItem("activatedComponents");
      let parsedData: Record<string, any>;

      // 解析存储的数据
      if (storedData) {
        parsedData = JSON.parse(storedData);
      } else {
        parsedData = {};
      }

      // 确保解析后的数据是普通对象，如果不是则重置为 {}
      if (
        typeof parsedData !== "object" ||
        parsedData === null ||
        Array.isArray(parsedData)
      ) {
        console.warn(
          "Stored workbench data is not a valid object, resetting to empty object."
        );
        parsedData = {};
      }

      // 使用逻辑或运算符确定键名，并更新数据
      const key = tempId || "tmp";
      parsedData[key] = _workbenchData;

      // 存储回 sessionStorage
      window.sessionStorage.setItem(
        "activatedComponents",
        JSON.stringify(parsedData)
      );
    } catch (error) {
      console.error(
        "Failed to update workbench data in sessionStorage:",
        error
      );
      // 可以根据需要添加更详细的错误处理逻辑，例如显示用户提示
    }
  };

  /**
   * 添加组件到画布
   * 注意: 直接修改外部变量activatedComponents
   * @param component 要添加的组件
   */
  const addComponent = (component: ComponentItem) => {
    if (!component) return;
    //console.log("component", component);
    setActivatedComponents([...activatedComponents, component]);
  };

  /**
   * 点击添加微件进入画布，临时舍弃
   * 微件高宽将在这里赋值
   * @param key 组件的Key
   */
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
      menuKey: key,
    };

    _component.width =
      (_component.minWidth >= _component.props?.gridColumn
        ? _component.minWidth
        : _component.props?.gridColumn) || 0;
    _component.height =
      (_component.minHeight >= _component.props?.gridRow
        ? _component.minHeight
        : _component.props?.gridRow) || 0;

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
      activatedComponents,
      contentIdRef.current,
      oldContentRef.current,
      tempId
    ); // 保存已激活模板信息到sessionStorage

    //console.log(activatedComponents);
  };

  /**
   * 保存模板
   */
  const handleSave = () => {
    setWorkbenchData(
      currentActivatedComponentsRef.current,
      contentIdRef.current,
      oldContentRef.current,
      tempId
    ); // 保存已激活模板信息到sessionStorage
  };

  const getActivatedComponents = (components:ComponentItem[]) => {
    //console.log("currentActivatedComponents", components);
    currentActivatedComponentsRef.current = [...components];
  }

  // 页面挂在后, 获取微件数据
  useEffect(() => {
    // 抓取路由参数tempId
    // if (!tempId) catchRouterData();

    // 根据微件数量设置菜单，并控制编辑区域高度
    fetchComponentData(_MicroCards, _gridRow, tempId, terminalType).then(
      (res) => {
        //console.log("res", res.activatedComponents);
        setActivatedComponents([...res.activatedComponents]);
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
              (res.components[0] || []).map((item, index) => {
                item.menuKey = `0-${item.key}_${index}`;
                return {
                  key: item.menuKey,
                  label: <DraggableMenuItem item={item} />,
                };
              }) || [],
          },
          {
            key: "2",
            label: "容器类",
            icon: <ContainerOutlined />,
            children:
              (res.components[1] || []).map((item, index) => {
                item.menuKey = `1-${item.key}_${index}`;
                return {
                  key: item.menuKey,
                  label: <DraggableMenuItem item={item} />,
                };
              }) || [],
          },
          {
            key: "3",
            label: "表单类",
            icon: <FormOutlined />,
            children:
              (res.components[2] || []).map((item, index) => {
                item.menuKey = `0-${item.key}_${index}`;
                return {
                  key: item.menuKey,
                  label: <DraggableMenuItem item={item} />,
                };
              }) || [],
          },
        ]);
      }
    );
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout>
        <Spin tip="loading" spinning={loading}>
          <Layout>
            <Sider style={siderStyle}>
              <div className={styles.title}>微件列表</div>
              <Menu
                defaultOpenKeys={["1", "2", "3"]}
                mode="inline"
                inlineCollapsed={collapsed}
                items={menuData}
              />
            </Sider>
            <Layout style={{ background: "#fff" }}>
              <Content style={{ overflow: "initial", padding: "20px 0" }}>
                <Suspense fallback={<h2>Loading...</h2>}>
                  <EditContext.Provider
                    value={{ activatedComponents, getActivatedComponents }}
                  >
                    <CoreComponent {...DynamicComponents[0].Props} />
                  </EditContext.Provider>
                </Suspense>
              </Content>
              <Footer
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Button type="primary" onClick={handleSave}>
                  保存
                </Button>
              </Footer>
            </Layout>
          </Layout>
        </Spin>
      </Layout>
    </DndProvider>
  );
}
