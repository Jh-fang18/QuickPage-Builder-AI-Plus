import { useMemo } from 'react';

interface GridStyleProps {
  minRowSpan: number;
  minColSpan: number;
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
}

interface CalculatedStyle {
  width: string;
  height: string;
}

export const useStyleCalculator = (props: GridStyleProps): CalculatedStyle => {
  return useMemo(() => {
    const {
      minRowSpan,
      minColSpan,
      gridRow,
      gridColumn,
      gridScale,
      gridPadding,
    } = props;

    const effectiveGridRow = gridRow > minRowSpan ? gridRow : minRowSpan;
    const effectiveGridCol = gridColumn > minColSpan ? gridColumn : minColSpan;
    
    const width = effectiveGridCol * gridScale + (effectiveGridCol - 1) * gridPadding;
    const height = effectiveGridRow * gridScale + (effectiveGridRow - 1) * gridPadding;

    return {
      width: `${Math.floor(width)}px`,
      height: `${Math.floor(height)}px`,
    };
  }, [props]);
};