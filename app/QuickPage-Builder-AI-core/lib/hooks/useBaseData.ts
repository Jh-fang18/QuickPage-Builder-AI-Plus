import { useMemo } from 'react';

export interface BaseDataProps<T, U = {}> {
  gridRow?: number;
  gridColumn?: number;
  gridScale: number;
  gridPadding: number;
  data?: T[];
  minShape: () => { minRowSpan: number; minColSpan: number };
  moduleProps?: U; // 模块特有属性
}

export const useBaseData = <T, U = {}>(props: BaseDataProps<T, U>) => {
  const { minRowSpan, minColSpan } = props.minShape();
  const { moduleProps } = props;
  
  return useMemo(() => ({
    minRowSpan,
    minColSpan,
    gridRow: props.gridRow || minRowSpan,
    gridColumn: props.gridColumn || minColSpan,
    gridScale: props.gridScale,
    gridPadding: props.gridPadding,
    data: [...(props.data || [])],
    moduleProps,
  }), [props.gridRow, props.gridColumn, props.gridScale, props.gridPadding, props.data, moduleProps]);
};