// 微件基础数据
export interface BaseDataType<T> {
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
  data: T[];
  currentIndex?: string;
  moduleProps?: {};
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
  /** 标签名 */
  label: string;
  /** 标签名宽度 */
  labelCol?: { span: number };
  /** 数据类型 */
  inputType: string;
  /** 输入值 */
  value: string;
  /** 占位符 */
  placeholder: string;
  /** 校验规则 */
  validateRules: ValidateRule[];
}

/** 提交按钮 */
export interface SubmitDataItem {
  /** ID */
  id: number;
  submitText: string;
  event: {
    /** 提交事件 */
    submit: () => void;
  };
}

/** 提交按钮 */
export interface FormMPPropsItem {
  /** ID */
  id: number;
  /** 表单名称 */
  name: string;
  /** 表单标题 */
  title: string;
}

// 发布票务微件基础数据
export interface LaunchTicketProps extends BaseDataType<LaunchTicketDataItem> {
  moduleProps?: BaseDataType<LaunchTicketDataItem>["moduleProps"] & {
    /** 标题 */
    title: string;
  };
}

export interface InputMPProps extends BaseDataType<InputDataItem> {}

export interface SubmitMPProps extends BaseDataType<SubmitDataItem> {}

export interface ContainerPCProps<T = any> extends BaseDataType<T> {
  MicroCards: MicroCardsType;
  activatedComponents: ComponentItem[];
  onActivatedComponents?: (components: ComponentItem[], index?: string) => void;
  data?: T[];
  html?: boolean;
  moduleProps?: BaseDataType<T>["moduleProps"] & {
    /** 用于drop时修正zindex识别鼠标滑过的元素 */
    zIndex: number;
  };
}

export interface FormMPProps<FormMPPropsItem> extends ContainerPCProps<T> {}
