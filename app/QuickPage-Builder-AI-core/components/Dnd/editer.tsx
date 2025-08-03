"use client";

// 导入库
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ContainerOutlined, DesktopOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Spin, Layout, Menu } from "antd";
const { Sider, Content } = Layout;
type MenuItem = Required<MenuProps>["items"][number];

// 导入自定义组件
import * as MicroCards from "../../MicroParts/index";

// 导入类型
import type { ComponentItem } from "../types/dnd";
import type { MicroCardsType } from "../../MicroParts/types/common";
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
  const [activatedComponents, setActivatedComponents] = useState<
    ComponentItem[]
  >([]);
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState(false);
  const [tempId, setTempId] = useState<string>("");
  const [terminalType, setTerminalType] = useState<number>(0);

  // ======================
  // 纯变量
  // ======================
  const _gridScale = gridScale || 30;
  const _gridPadding = gridPadding || 20;

  const DynamicComponents = [
    {
      Name: "index",
      Props: {
        terminalType,
        activatedComponents,
        gridRow: _gridRow,
        gridColumn: _gridColumn,
        gridScale: _gridScale,
        gridPadding: _gridPadding,
      },
    },
  ];
  const CurrentComponent = dynamic(
    () => import(`./Core/${DynamicComponents[0].Name}`),
    { loading: () => <div>加载中...</div> }
  );

  // 页面挂在后, 获取微件数据
  useEffect(() => {
    // 根据微件数量设置菜单，并控制编辑区域高度
    fetchComponentData(
      _MicroCards,
      _gridRow,
      Number(tempId),
      terminalType
    ).then((res) => {
      setActivatedComponents(res.activatedComponents);
      console.log(res.gridRow)
      setGridRow(res.gridRow);

      setMenuData([
        {
          key: "1",
          label: "其他类",
          icon: <DesktopOutlined />,
          children:
            (res.components[0] || []).map((item, index) => ({
              key: item.key,
              label: item.title,
            })) || [],
        },
        {
          key: "2",
          label: "容器类",
          icon: <ContainerOutlined />,
          children: [],
        },
      ]);
    });
  }, []);

  return (
    <Layout>
      <Spin tip="loading" spinning={loading}>
        <Layout>
          <Sider>
            <div className="title">
              <span>微件列表</span>
            </div>
            <Menu
              defaultOpenKeys={["1"]}
              mode="inline"
              inlineCollapsed={collapsed}
              items={menuData}
            />
          </Sider>
          <Content>
            <CurrentComponent {...(DynamicComponents[0].Props as any)} />
          </Content>
        </Layout>
      </Spin>
    </Layout>
  );
}
