
import { createElement } from "react";

import { ComponentItem, MicroCardsType } from "../../types/common";

const dynamicComponent = (
  currentIndex: string,
  index: number,
  gridScale: number,
  gridPadding: number,
  MicroCards: MicroCardsType,
  activatedComponents: ComponentItem[],
  html: boolean,
  handleSetActivatedComponents?: (activatedComponents: ComponentItem[], index: string) => void,
) => {
  const componentName = activatedComponents[index].url;
  const _component = MicroCards[componentName];
  const newActivatedComponents = activatedComponents.map((item, i) =>
    i === index
      ? {
          ...item,
          props: {
            ...(item?.props || {}),
          },
        }
      : item
  );

  if (!_component) return null;

  const { minColSpan, minRowSpan } = _component.minShape();

  // 还需添加传入props的类型验证
  return createElement(_component, {
    ...(newActivatedComponents[index]?.props || {}),
    currentIndex: `${currentIndex}-${index}`,
    gridColumn:
      newActivatedComponents[index]?.width ||
      newActivatedComponents[index]?.props.gridColumn ||
      minColSpan,
    gridRow:
      newActivatedComponents[index]?.height ||
      newActivatedComponents[index]?.props.gridRow ||
      minRowSpan,
    gridScale,
    gridPadding,
    MicroCards,
    moduleProps: newActivatedComponents[index]?.props.moduleProps,
    html: html,
    onActivatedComponents: handleSetActivatedComponents,
  });
};

export { dynamicComponent };