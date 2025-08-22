// 微件基础数据
export interface BaseDataType<T> {
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
  data: T[];
}

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

/** 输入框 */
export interface InputDataItem {
  /** ID */
  id: number;
  /** 数据类型 */
  inputType: string;
  /** 输入值 */
  value: string;
  /** 占位符 */
  placeholder: string;
  /** 校验规则 */
  validateRules: ValidateRule[];
}

// 发布票务微件基础数据
export interface LaunchTicketProps extends BaseDataType<LaunchTicketDataItem> {
  moduleProps?: {
    /** 标题 */
    title: string;
  };
}

export interface InputMPProps extends BaseDataType<InputDataItem> {
  moduleProps?: {
    /** 标签名 */
    label: string;
  };
}
