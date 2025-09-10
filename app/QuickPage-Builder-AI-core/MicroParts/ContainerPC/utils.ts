import { createElement } from "react";

import { ComponentItem, MicroCardsType } from "../../types/common";

const dynamicComponent = (
  props: Record<string, any> & {
    currentIndex: string;
    index: number;
    gridScale: number;
    gridPadding: number;
    MicroCards: MicroCardsType;
    activatedComponent: ComponentItem;
    html: boolean;
    onActivatedComponents?: (
      activatedComponents: ComponentItem[],
      index: string
    ) => void;
  }
) => {
  const {
    currentIndex,
    index,
    gridScale,
    gridPadding,
    MicroCards,
    activatedComponent,
  } = props;
  const componentName = activatedComponent.url;
  const _component = MicroCards[componentName];
  if (!_component) return null;
  
  const newActivatedComponent = {
    ...activatedComponent,
    props: {
      ...(activatedComponent.props || {}),
      moduleProps: {
        ...(activatedComponent.props?.moduleProps || {}),
      },
      data: [...(activatedComponent.props?.data || [])]
    },
  };

  const { minColSpan, minRowSpan } = _component.minShape();

  // 动态构建传递给子组件的参数
  const childProps: any = {
    // 基础参数, 包括activatedComponents, moduleProps, data
    ...(newActivatedComponent?.props || {}),
    currentIndex: `${currentIndex}-${index}`,
    gridColumn:
      newActivatedComponent?.width ||
      newActivatedComponent?.props.gridColumn ||
      minColSpan,
    gridRow:
      newActivatedComponent?.height ||
      newActivatedComponent?.props.gridRow ||
      minRowSpan,
    gridScale,
    gridPadding,
  };

  // 遍历requiredProps动态赋值
  if (_component.requiredProps && Array.isArray(_component.requiredProps)) {
    _component.requiredProps.forEach((prop) => {
      if (props.hasOwnProperty(prop)) {
        childProps[prop] = props[prop];
      }
    });
  }

  // 还需添加传入props的类型验证
  return createElement(_component, childProps);
};

export { dynamicComponent };
