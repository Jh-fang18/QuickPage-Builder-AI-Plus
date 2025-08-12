/** 发布票务 */
export interface LaunchTicketDataItem {
  /** ID */
  id: number;
  /** 背景色*/
  color: string;
  /** 显示名称 */
  showName: string;
  /** 展示内容 */
  explain: string;
}

// 微件基础数据
export interface BaseDataType {
  minRowSpan: number;
  minColSpan: number;
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
}

// 发布票务微件基础数据
export interface LaunchTicketProps extends BaseDataType {
  data: LaunchTicketDataItem[];
}

