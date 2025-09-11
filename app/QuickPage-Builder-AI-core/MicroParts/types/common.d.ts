import { FormProps, FormItemProps, ButtonProps } from "antd";
import { MicroCardsType } from "../../types/common";

// 微件基础数据
export interface BaseDataType<T = any> {
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
  data: T[]; // 微件可修改属性，数组形式，方便扩展，单值现默认是[0]
  currentIndex?: string;
  moduleProps?: {
    // 微件模块属性, 不能修改的属性
    /** 形态 */
    morph?: {
      up: boolean;
      down: boolean;
      left: boolean;
      right: boolean;
    };
  };
}

// 创建预定义的联合类型
export type SupportedDataTypes =
  | InputDataItem
  | SubmitDataItem
  | FormMPDataItem;

/** 微件props基础数据项 */
export interface BaseDataItem<T = any> {
  /** 可修改的属性继承自ant对应模块 */
  itemProps: T & {
    gridScale?: number;
    gridPadding?: number;
  };
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
export interface InputDataItem extends BaseDataItem<FormItemProps> {
  /** input name的类型 */
  nameType: string;
  /** input name的值 */
  nameValue: string;
}

/** 提交按钮 */
export interface SubmitDataItem extends BaseDataItem<ButtonProps> {
  itemProps?: BaseDataItem<ButtonProps>["itemProps"] & {
    /** 按钮文本 */
    submitText: string;
  };
}

/** from表单 */
export interface FormMPDataItem extends BaseDataItem<FormProps> {
  /** 表单名称 */
  name: string;
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

export interface ContainerPCProps<T = any> extends BaseDataType {
  html: boolean;
  MicroCards: MicroCardsType;
  activatedComponents: ComponentItem[];
  onActivatedComponents: (components: ComponentItem[], index?: string) => void;
  moduleProps: BaseDataType["moduleProps"] & {
    //微件不能修改的属性
    /** 用于drop时修正zindex识别鼠标滑过的元素 */
    zIndex: number;
  };
  data?: T[]; // 微件可修改属性
}

export interface ContainerPCHTMLProps extends ContainerPCProps {
  onActivatedComponents?: (components: ComponentItem[], index?: string) => void;
}
export interface FormMPProps extends ContainerPCProps<FormMPDataItem> {}
