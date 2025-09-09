import { createElement } from "react";

import { ComponentItem, MicroCardsType } from "../../types/common";

const dynamicComponent = (props: {
  currentIndex: string;
  index: number;
  gridScale: number;
  gridPadding: number;
  MicroCards: MicroCardsType;
  activatedComponent: ComponentItem;
  html?: boolean;
  handleSetActivatedComponents?: (
    activatedComponents: ComponentItem[],
    index: string
  ) => void;
}) => {
  const {
    currentIndex,
    index,
    gridScale,
    gridPadding,
    MicroCards,
    activatedComponent,
    html,
    handleSetActivatedComponents,
  } = props;
  const componentName = activatedComponent.url;
  const _component = MicroCards[componentName];
  const newActivatedComponent = {
    ...activatedComponent,
    props: {
      ...(activatedComponent.props || {}),
    },
  };

  if (!_component) return null;

  const { minColSpan, minRowSpan } = _component.minShape();

  // 动态构建传递给子组件的参数
  const childProps: any = {
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

  // 检查组件是否需要 MicroCards 参数
  if (_component.requiredProps && _component.requiredProps.includes('MicroCards')) {
    childProps.MicroCards = MicroCards;
  }

  // 检查组件是否需要 moduleProps 参数
  if (newActivatedComponent.props.moduleProps) {
    childProps.moduleProps = { ...newActivatedComponent?.props.moduleProps };
  }

  // 检查组件是否需要 html 参数
  if (_component.requiredProps && _component.requiredProps.includes('html')) {
    childProps.html = html;
  }

  // 检查组件是否需要 onActivatedComponents 参数
  if (_component.requiredProps && _component.requiredProps.includes('onActivatedComponents')) {
    childProps.onActivatedComponents = handleSetActivatedComponents;
  }

  // 还需添加传入props的类型验证
  return createElement(_component, childProps);
};

export { dynamicComponent };
