import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CollectionGridProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  preferredRows?: number;
  minItemSize?: number;
  maxItemSize?: number;
  itemsPerPage?: number;
  gap?: number;
}

const DEFAULT_PREFERRED_ROWS = 4;
const DEFAULT_MIN_ITEM_SIZE = 230;
const DEFAULT_MAX_ITEM_SIZE = 270;
const DEFAULT_GAP = 0;

const CollectionGrid = <T extends { id: string }>({
  items,
  renderItem,
  preferredRows = DEFAULT_PREFERRED_ROWS,
  minItemSize = DEFAULT_MIN_ITEM_SIZE,
  maxItemSize = DEFAULT_MAX_ITEM_SIZE,
  itemsPerPage,
  gap = DEFAULT_GAP,
}: CollectionGridProps<T>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [columns, setColumns] = useState(1);
  const [itemSize, setItemSize] = useState(minItemSize);

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
    const layoutItems = Math.max(totalItems, itemsPerPage ?? totalItems);
    let rows = Math.min(preferredRows, layoutItems);

    const computeItemSize = (cols: number) => (width - gap * (cols - 1)) / cols;

    let nextColumns = Math.ceil(layoutItems / rows);
    let nextItemSize = computeItemSize(nextColumns);

    while (nextItemSize > maxItemSize && rows > 1) {
      rows -= 1;
      nextColumns = Math.ceil(layoutItems / rows);
      nextItemSize = computeItemSize(nextColumns);
    }

    while (nextItemSize < minItemSize && rows < layoutItems) {
      rows += 1;
      nextColumns = Math.ceil(layoutItems / rows);
      nextItemSize = computeItemSize(nextColumns);
    }

    const maxAllowedSize = Math.min(maxItemSize, width);
    const minAllowedSize = Math.min(minItemSize, maxAllowedSize);
    const boundedItemSize = Math.min(Math.max(nextItemSize, minAllowedSize), maxAllowedSize);

    setColumns(Math.min(nextColumns, totalItems));
    setItemSize(boundedItemSize);
  }, [gap, items.length, maxItemSize, itemsPerPage, minItemSize, preferredRows]);

  useEffect(() => {
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
