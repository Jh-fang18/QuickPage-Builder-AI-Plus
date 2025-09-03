import { createElement } from "react";

import { ComponentItem, MicroCardsType } from "../../types/common";

const dynamicComponent = (
  currentIndex: string,
  index: number,
  gridScale: number,
  gridPadding: number,
  MicroCards: MicroCardsType,
  activatedComponent: ComponentItem,
  html: boolean,
  handleSetActivatedComponents?: (
    activatedComponents: ComponentItem[],
    index: string
  ) => void
) => {
  const componentName = activatedComponent.url;
  const _component = MicroCards[componentName];
  const newActivatedComponent = {
    ...activatedComponent,
    props: {
      ...(activatedComponent?.props || {}),
    },
  };

  if (!_component) return null;

  const { minColSpan, minRowSpan } = _component.minShape();

  // 还需添加传入props的类型验证
  return createElement(_component, {
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
    MicroCards,
    moduleProps: newActivatedComponent?.props.moduleProps,
    html: html,
    onActivatedComponents: handleSetActivatedComponents,
  });
};

export { dynamicComponent };
