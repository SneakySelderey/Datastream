import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface CollectionGridProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  minItemSize?: number;
  maxItemSize?: number;
  gap?: number;
}

const DEFAULT_MIN_ITEM_SIZE = 170;
const DEFAULT_MAX_ITEM_SIZE = 290;
const DEFAULT_GAP = 0;
const BREAKPOINT_COLUMNS = [
  { minWidth: 1600, columns: 9 },
  { minWidth: 900, columns: 6 },
  { minWidth: 640, columns: 4 },
  { minWidth: 0, columns: 2 },
];

const CollectionGrid = <T extends { id: string }>({
  items,
  renderItem,
  minItemSize = DEFAULT_MIN_ITEM_SIZE,
  maxItemSize = DEFAULT_MAX_ITEM_SIZE,
  gap = DEFAULT_GAP,
}: CollectionGridProps<T>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [columns, setColumns] = useState(1);
  const [itemSize, setItemSize] = useState(minItemSize);
  const [isMeasured, setIsMeasured] = useState(false);

  const calculateLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const width = container.clientWidth;
    if (width <= 0) {
      return;
    }

    const totalItems = Math.max(items.length, 1);
    const computeItemSize = (cols: number) => (width - gap * (cols - 1)) / cols;

    const breakpointColumns = BREAKPOINT_COLUMNS.find((bp) => width >= bp.minWidth)?.columns ?? 2;
    let nextColumns = Math.min(Math.max(1, breakpointColumns), totalItems);
    let nextItemSize = computeItemSize(nextColumns);

    while (nextItemSize > maxItemSize && nextColumns < totalItems) {
      nextColumns += 1;
      nextItemSize = computeItemSize(nextColumns);
    }

    while (nextItemSize < minItemSize && nextColumns > 1) {
      nextColumns -= 1;
      nextItemSize = computeItemSize(nextColumns);
    }

    const maxAllowedSize = Math.min(maxItemSize, width);
    const minAllowedSize = Math.min(minItemSize, maxAllowedSize);
    const boundedItemSize = Math.min(Math.max(nextItemSize, minAllowedSize), maxAllowedSize);

    setColumns(nextColumns);
    setItemSize(boundedItemSize);
    setIsMeasured(true);
  }, [gap, items.length, maxItemSize, minItemSize]);

  useLayoutEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(() => {
      calculateLayout();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [calculateLayout]);

  return (
    <div
      ref={containerRef}
      className={'mt-5 grid justify-start'}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, ${itemSize}px))`,
        gap: `${gap}px`,
        visibility: isMeasured ? 'visible' : 'hidden',
      }}
    >
      {items.map((item) => (
        <div key={item.id}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};

export default CollectionGrid;
