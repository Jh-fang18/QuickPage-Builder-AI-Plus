/**
 * 用户基本信息类型定义
 */
type UserInfo = {
  userId: string; // 用户唯一标识符
  userName: string; // 用户显示名称
  roles: string[]; // 用户角色数组
};

/**
 * 认证信息接口定义
 */
export interface AuthInfo {
  token: string; // JWT认证令牌
  expires: number; // 令牌过期时间戳(秒)
  userInfo: UserInfo; // 关联的用户信息
}

/** 自助服务数据项 */
export interface SelfServiceDataItem {
  /** 服务项ID */
  id: number;
  /** 服务项名称 */
  itemName: string;
  /** 服务对应的API端点 */
  url: string;
  /** 组件的属性 */
  props: {
    [key: string]: any;
  };
}

/** 可拖拽组件的基础元数据 */
export interface ComponentItem<T = any> {
  /** 组件显示名称 */
  title: string;
  /** 组件唯一标识符（格式：组件ID） */
  key: string;
  /** 组件对应的组件路径 */
  url: string;
  /** 组件最小宽度（栅格单位） */
  minWidth: number;
  /** 组件最小高度（栅格单位） */
  minHeight: number;
  /** 组件当前宽度（栅格单位） */
  width: number;
  /** 组件当前高度（栅格单位） */
  height: number;
  /** 是否允许编辑标题 */
  editTitle: boolean;
  /** X轴位置（栅格单位） */
  positionX: number;
  /** Y轴位置（栅格单位） */
  positionY: number;
  /** 关联的自助服务数据 */
  selfServiceData: SelfServiceDataItem;
  /** 菜单结构中的唯一键 */
  menuKey: string;
  /** CSS Grid布局坐标（格式：row-start/column-start/row-end/column-end） */
  ccs: string;
  /** 用于记录当前组件的行索引, 即在画布的位置顺序 */
  rowIndex: number;
  /** 组件的属性 */
  props: {
    [key: string]: any;
    /** 组件的属性 */
    moduleProps?: {
      [key: string]: any;
    };
    data?: T[];
  };
}

/**
 * 表单状态接口
 * 用于管理画布网格布局的配置状态
 */
export interface FormState {
  /** 画布行数（垂直方向栅格数） */
  gridRow: number;
  /** 画布列数（水平方向栅格数） */
  gridColumn: number;
}

/** 组件数据规范（用于动态加载组件） */
export interface TempInfoData {
  /** 模板ID */
  tempId: number;
  /** 组件列表 */
  dataList: {
    id: number;
    content: string;
  };
}

/** 组件数据规范（用于动态加载组件） */
export interface SelfServiceData {
  /** 组件列表 */
  dataList: SelfServiceDataItem[];
}

interface MicroCardComponent extends React.FC<any> {
  minShape: () => {
    minRowSpan: number;
    minColSpan: number;
  };
  requiredProps?: string[]; // 声明该组件需要的参数
}

// 微件组件类型
export type MicroCardsType = Record<string, MicroCardComponent>;
