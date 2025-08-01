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
  rowSpan: number;
  colSpan: number;
  gridSize: number;
  gridSpace: number;
}

// 发布票务微件基础数据
export interface LaunchTicketBaseData extends BaseDataType {
  data: LaunchTicketDataItem[];
}

interface MicroCardComponent extends React.FC<any> {
  minShape: () => {
    minRowSpan: number;
    minColSpan: number;
  };
}

// 微件组件类型
export type MicroCardsType = Record<string, MicroCardComponent>;
