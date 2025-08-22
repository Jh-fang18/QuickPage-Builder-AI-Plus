import { message } from "antd";

// 导入类型
import type {
  ComponentItem,
  SelfServiceData,
  SelfServiceDataItem,
  FormState,
  TempInfoData,
} from "../../../types/common";

import type { MicroCardsType } from "../../../types/common";

// 导入数据 (临时获取数据来源)
import selfServiceItemList from "../mock/self-service-item-list";
import selfServiceItemListForm from "../mock/self-service-item-list-form";
import selfServiceItemListContainer from "../mock/self-service-item-list-container";
import tempInfo from "../mock/temp-Info";

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
    const res: SelfServiceData = await (() => {
      switch (itemType) {
        case 0:
          return selfServiceItemList;
        case 1:
          return selfServiceItemListContainer;
        case 2:
          return selfServiceItemListForm;
        default:
          throw new Error(`Unknown itemType: ${itemType}`);
      }
    })();

    const _format = JSON.parse(JSON.stringify(res));

    if (!_format?.dataList || _format?.dataList.length === 0)
      message.error("数据加载失败");

    return _format;
  }, "获取微件数据失败");
};

/**
 * 获取页面数据
 * @param tempId 模板id
 * @param navigationId 导航id
 * @returns Promise包装的响应数据或null
 */
const getTempInfo = (data: {
  tempId: string | number;
  navigationId?: number;
}) => {
  return handleApiRequest(async () => {
    const res: TempInfoData = await tempInfo;

    const _format = JSON.parse(JSON.stringify(res));

    // res内容判断，如果没有数据或者提示错误，直接返回
    if (!_format?.tempId && !_format?.dataList) {
      message.error("没有TempId数据加载失败");
      return null;
    }

    const { content: _content, id: _contentId } = _format!.dataList || {};

    return {
      contentId: _contentId || 0,
      oldContent: _content || "[]",
      activatedComponents: (JSON.parse(_content) as ComponentItem[]) || [],
    };
  }, "获取页面数据失败");
};

/**
 * 更新组件列表
 * @param item 微件
 * @param minRowSpan 最小行距
 * @param minColSpan 最小列距
 * @param selfServiceData 微件数据
 * @returns 新微件数据类型为ComponentItem[]
 */
const updateComponentItem = (
  item: ComponentItem,
  minColSpan: number,
  minRowSpan: number,
  selfServiceData: SelfServiceDataItem
): ComponentItem => ({
  ...item,
  minWidth: minColSpan,
  minHeight: minRowSpan,
  width: 0,
  height: 0,
  editTitle: false,
  positionX: 0,
  positionY: 0,
  selfServiceData,
});

/**
 * 数据获取方法
 * @param MicroCards 微件
 * @param gridRow 网格行数
 * @param tempId 模板id
 * @param terminalType 终端类型
 * @returns components 所有组件, activatedComponents 激活组件, gridRow 画布高度,contentId: 内容ID, oldContent: 内容
 *
 */
export const fetchComponentData = async (
  MicroCards: MicroCardsType,
  gridRow: number,
  tempId?: number,
  terminalType?: number
) => {
  let _components: ComponentItem[][] = [];
  let _activatedComponents: ComponentItem[] = [];
  let _gridRow = gridRow;
  let _contentId = 0;
  let _oldContent = "[]";

  // 设置路由参数
  // if (route.query.tempIdQuery || route.query.terminalTypeQuery) {
  //   catchRouterData();
  // }

  // 获取组件列表, promise.all返回的是数组
  await Promise.all([
    getSelfServiceItemList(0, 0), //其他类
    getSelfServiceItemList(1, 0), //容器类
    getSelfServiceItemList(2, 0), //表单类
  ])
    .then((res) => {
      // console.log("res", res);
      if (!res) return;
      
      (res || []).map((item, index) => {
        let dataList: SelfServiceDataItem[] = item?.dataList || [];
        console.log("dataList", dataList);
        // 获取组件基本信息
        _components[index] = (dataList || []).map((item) => {
          return {
            title: item.itemName,
            key: String(item.id), // 生成menu data时使用，将以0-${item.key}_${index}覆盖,
            url: item.url,
            minWidth: 0,
            minHeight: 0,
            width: 0,
            height: 0,
            editTitle: false,
            positionX: 0,
            positionY: 0,
            menuKey: "",
            ccs: "",
            rowIndex: 0,
            selfServiceData: {} as SelfServiceDataItem,
            props: item.props || {},
          };
        });

        //console.log(_components);
        //console.log(1,MicroCards);
        //console.log(2,microParts);

        // PC端
        if (terminalType === 0) {
          // 删除不存在的微件，避免报错
          // 赋值最小高宽
          _components[index] = _components[index].filter((item, index) => {
            const microCard = MicroCards[item?.url] ?? null;
            if (microCard) {
              const { minRowSpan, minColSpan } = microCard.minShape();

              Object.assign(
                item,
                updateComponentItem(
                  item,
                  minColSpan,
                  minRowSpan,
                  dataList[index]
                )
              );
            }
            return !!microCard;
          });

          // 抓取路由参数tempId
          // if (!tempId.value) catchRouterData();

          // 从sessionStorage中获取已激活组件数据
          const workbenchData = JSON.parse(
            window.sessionStorage.getItem("activatedComponents") || "{}"
          );

          if (tempId && workbenchData[tempId]) {
            const { contentId, activatedComponents, oldContent } =
              workbenchData[tempId];
            _contentId = contentId;
            _oldContent = oldContent;
            _activatedComponents = [...activatedComponents];
          } else
            getTempInfo({
              tempId: tempId || 0,
            }).then((res) => {
              if (res) {
                const { contentId, activatedComponents, oldContent } = res;
                _contentId = contentId;
                _oldContent = oldContent;
                _activatedComponents = [...activatedComponents];
              }
            });

          // 设置画布高度
          if (_activatedComponents && _activatedComponents.length > 0) {
            let _gridRow = _activatedComponents[
              _activatedComponents.length - 1
            ]["ccs"]
              .split("/")
              .map((item) => Number(item))[2];
            _gridRow = _gridRow < gridRow ? gridRow : _gridRow;
          }
        }
      });
    })
    .catch((err) => {
      console.error("获取模板信息失败:", err);
      message.error("数据加载失败"); // 新增错误提示
    });

  return {
    components: _components,
    activatedComponents: _activatedComponents,
    gridRow: _gridRow,
    contentId: _contentId,
    oldContent: _oldContent,
  };
};
