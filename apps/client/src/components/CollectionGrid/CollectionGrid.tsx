import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CollectionGridProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  preferredRows?: number;
  minItemSize?: number;
  maxItemSize?: number;
  gap?: number;
}

const DEFAULT_PREFERRED_ROWS = 3;
const DEFAULT_MIN_ITEM_SIZE = 180;
const DEFAULT_MAX_ITEM_SIZE = 300;
const DEFAULT_GAP = 4;

const CollectionGrid = <T extends { id: string }>({
  items,
  renderItem,
  preferredRows = DEFAULT_PREFERRED_ROWS,
  minItemSize = DEFAULT_MIN_ITEM_SIZE,
  maxItemSize = DEFAULT_MAX_ITEM_SIZE,
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
    let rows = Math.min(preferredRows, totalItems);

    const computeItemSize = (cols: number) => (width - gap * (cols - 1)) / cols;

    let nextColumns = Math.ceil(totalItems / rows);
    let nextItemSize = computeItemSize(nextColumns);

    while (nextItemSize > maxItemSize && rows > 1) {
      rows -= 1;
      nextColumns = Math.ceil(totalItems / rows);
      nextItemSize = computeItemSize(nextColumns);
    }

    while (nextItemSize < minItemSize && rows < totalItems) {
      rows += 1;
      nextColumns = Math.ceil(totalItems / rows);
      nextItemSize = computeItemSize(nextColumns);
    }

    const maxAllowedSize = Math.min(maxItemSize, width);
    const minAllowedSize = Math.min(minItemSize, maxAllowedSize);
    const boundedItemSize = Math.min(Math.max(nextItemSize, minAllowedSize), maxAllowedSize);

    setColumns(nextColumns);
    setItemSize(boundedItemSize);
  }, [gap, items.length, maxItemSize, minItemSize, preferredRows]);

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
      className="mt-5 grid justify-center"
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
