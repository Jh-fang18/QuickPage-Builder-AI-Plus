import type { AuthInfo } from './global'

/** 自助服务数据项 */
export interface SelfServiceDataItem {
  /** 服务项ID */
  id: number
  /** 服务项名称 */
  itemName: string
  /** 服务对应的API端点 */
  url: string
}

/** 可拖拽组件的基础元数据 */
export interface ComponentItem {
  /** 组件显示名称 */
  title: string
  /** 组件唯一标识符（格式：分类ID-组件ID） */
  key: string
  /** 组件对应的Vue组件路径（可选） */
  url: string
  /** 组件最小宽度（栅格单位） */
  minWidth: number
  /** 组件最小高度（栅格单位） */
  minHeight: number
  /** 组件当前宽度（栅格单位） */
  width: number
  /** 组件当前高度（栅格单位） */
  height: number
  /** 是否允许编辑标题 */
  editTitle: boolean
  /** X轴位置（栅格单位） */
  positionX: number
  /** Y轴位置（栅格单位） */
  positionY: number
  /** 关联的自助服务数据 */
  selfServiceData: SelfServiceDataItem
  /** 菜单结构中的唯一键（格式：父节点ID-当前节点ID） */
  menuKey: string
  /** CSS Grid布局坐标（格式：row-start/column-start/row-end/column-end） */
  ccs: string
  /** 用于记录当前组件的行索引, 即在画布的位置顺序 */
  rowIndex: number
}

/**
 * 表单状态接口
 * 用于管理画布网格布局的配置状态
 */
export interface FormState {
  /** 画布行数（垂直方向栅格数） */
  gridRow: number
  /** 画布列数（水平方向栅格数） */
  gridColumn: number
}

/** 微件卡片数据规范（用于动态加载组件） */
export interface CardData {
  /** 获取组件布局约束的方法 */
  minShape: () => {
    /** 最小行跨度 */
    minRowSpan: number
    /** 最小列跨度 */
    minColSpan: number
  }
}

/** 组件数据规范（用于动态加载组件） */
export interface TempInfoData extends AuthInfo {
  /** 模板ID */
  tempId: number
  /** 组件列表 */
  dataList: {
    id: number
    content: string
  }
}

/** 组件数据规范（用于动态加载组件） */
export interface SelfServiceData extends AuthInfo {
  /** 组件列表 */
  dataList: SelfServiceDataItem[]
}
