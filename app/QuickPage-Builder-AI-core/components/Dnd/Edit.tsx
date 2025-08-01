"use client";

// 导入库
import React, { Suspense, useState, useEffect } from "react";
import { Spin, Layout, Menu, message } from "antd";
const { Sider, Content } = Layout;

// 导入自定义组件
import * as MicroCards from "../../MicroParts/index";

// 导入类型
import type {
  ComponentItem,
  SelfServiceData,
  SelfServiceDataItem,
  CardData,
  FormState,
  TempInfoData,
} from "../types/dnd";

// 导入数据 (临时获取数据来源)
import data from "../../lib/data/micro-parts";

export default function Edit({ microParts }: { microParts: Record<string, React.FC<any>> }) {
  // 合并微件
  const _MicroCards = {
    ...MicroCards,
    ...microParts,
  };

  // ======================
  // 响应式状态
  // ======================

  const [loading, setLoading] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState(false);
  const [components, setComponents] = useState<ComponentItem[][]>([]);
  const [terminalType, setTerminalType] = useState<number>(0);

  /** end */

  /* ====================== 核心方法 ====================== */

  /**
   * 封装API请求处理
   * @param apiCall API调用函数
   * @param errorMessage 系统错误提示信息
   * @returns Promise包装的响应数据或null
   */
  const handleApiRequest = async <T extends unknown>(
    apiCall: () => Promise<T>,
    errorMessage: string = "操作失败"
  ): Promise<T | null> => {
    try {
      return await apiCall();
    } catch (error: unknown) {
      message.error(`${errorMessage}`);
      return null;
    }
  };

  // ======================
  // 微件数据操作
  // ======================

  /**
   * 更新组件列表
   * @param item 微件
   * @param minRowSpan 最小行距
   * @param minColSpan 最小列距
   * @param selfServiceData 微件数据
   * @returns Promise包装的响应数据或null
   */
  const updateComponentItem = (
    item: ComponentItem,
    minRowSpan: number,
    minColSpan: number,
    selfServiceData: SelfServiceDataItem
  ): ComponentItem => ({
    ...item,
    minWidth: minRowSpan,
    minHeight: minColSpan,
    width: minRowSpan,
    height: minColSpan,
    editTitle: false,
    positionX: 0,
    positionY: 0,
    selfServiceData,
  });

  /**
   * 获取微件数据
   * @param itemType 微件类型
   * @param terminalType 终端类型
   * @returns Promise包装的响应数据或null
   */
  const getSelfServiceItemList = async (
    itemType: number,
    terminalType: number
  ) => {
    return handleApiRequest(async () => {
      const res: SelfServiceData = data;

      if (!res?.dataList || res?.dataList.length === 0)
        message.error("数据加载失败");

      return res;
    }, "获取微件数据失败");
  };

  // 数据获取方法
  const fetchComponentData = async () => {
    // 设置路由参数
    // if (route.query.tempIdQuery || route.query.terminalTypeQuery) {
    //   catchRouterData();
    // }

    //获取组件列表
    await Promise.all([
      getSelfServiceItemList(0, 0), //其他类
    ])
      .then((res) => {
        if (!res) return;

        (res || []).map((item, index) => {
          let dataList: SelfServiceDataItem[] = item?.dataList || [];
          //console.log(dataList);

          //获取组件基本信息
          components[index] = (dataList || []).map((item) => {
            return {
              title: item.itemName,
              key: String(item.id),
              url: item.url,
              minWidth: 0,
              minHeight: 0,
              width: 0,
              height: 0,
              editTitle: false,
              positionX: 0,
              positionY: 0,
              selfServiceData: {} as SelfServiceDataItem,
              menuKey: "",
              ccs: "",
              rowIndex: 0,
            };
          });

          //console.log(state.components);
          //console.log(1,MicroCards);
          //console.log(2,state.microParts);

          // PC端
          if (terminalType === 0) {
            //删除不存在的微件
            components[index] = components[index].filter((item, index) => {
              const microCard: CardData = item.url && _MicroCards[item.url];
              if (microCard) {
                const { minRowSpan, minColSpan } = microCard.minShape();
                Object.assign(
                  item,
                  updateComponentItem(
                    item,
                    minRowSpan,
                    minColSpan,
                    dataList[index]
                  )
                );
              }
              return !!microCard;
            });

            // 抓取路由参数tempId
            // if (!tempId.value) catchRouterData();

            // 从sessionStorage中获取已激活组件数据
            const workbenchData: Record<string, any> = JSON.parse(
              window.sessionStorage.getItem("activatedComponents") || "{}"
            );

            if (workbenchData[tempId.value]) {
              const {
                contentId: _contentId = 0,
                activatedComponents: _activatedComponents = [],
                oldContent: _oldContent = "[]",
                checkedKeys: _checkedKeys,
              } = workbenchData[tempId.value];

              // 更新state.activatedComponents
              activatedComponents(
                _contentId,
                _activatedComponents,
                _oldContent,
                _checkedKeys
              );
            } else
              getTempInfo({
                tempId: tempId.value,
              }).then((res) => {
                if (res) {
                  const {
                    contentId: _contentId = 0,
                    activatedComponents: _activatedComponents = [],
                    oldContent: _oldContent = "[]",
                  } = res;

                  // 更新state.activatedComponents
                  activatedComponents(
                    _contentId,
                    _activatedComponents,
                    _oldContent
                  );

                  //临时记录选中模块 in store
                  store.commit("dnd/PUSH_CHECKEDKEYS", [
                    ...(MicroCardsList.value || [])
                      .filter((item) =>
                        (state.activatedComponents || []).find(
                          (iitem) =>
                            iitem.key === item.key.split("-")[2].split("_")[1]
                        )
                      )
                      .map((item) => item.key),
                    ...(ContainersList.value || [])
                      .filter((item) =>
                        (state.activatedComponents || []).find(
                          (iitem) =>
                            iitem.key === item.key.split("-")[2].split("_")[1]
                        )
                      )
                      .map((item) => item.key),
                  ]);
                }
              });

            // 设置画布高度
            if (
              state.activatedComponents &&
              state.activatedComponents.length > 0
            ) {
              let _gridRow = state.activatedComponents[
                state.activatedComponents.length - 1
              ]["ccs"]
                .split("/")
                .map((item) => Number(item))[2];
              gridRow.value = _gridRow < 36 ? 36 : _gridRow;
            }
          }
        });
      })
      .catch((err) => {
        console.error("获取模板信息失败:", err);
        message.error("数据加载失败"); // 新增错误提示
      });
  };
  //  const CurrentComponent = React.lazy(() => import(`./${componentName}`));
  /** end */

  // 页面挂在后，设置树结构
  useEffect(() => {
    // 获取微件数据
    fetchComponentData();
  }, []);

  return (
    <Layout>
      <Spin tip="loading" spinning={loading}>
        <Sider>
          <div className="title">
            <span>微件列表</span>
          </div>
          <Menu
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            mode="inline"
            inlineCollapsed={collapsed}
            items={data.dataList}
          />
        </Sider>
        <Layout>
          <Content>
            {/* <CurrentComponent
              terminalType="Number(terminalType)"
              activatedComponents="state.activatedComponents"
              gridRow="gridRow"
              griColumn="gridColumn"
              microParts="microParts"
            /> */}
          </Content>
        </Layout>
      </Spin>
    </Layout>
  );
}
