import React from 'react';

interface CollectionGridProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

const CollectionGrid = <T extends { id: string }>({ items, renderItem }: CollectionGridProps<T>) => {
  return (
    <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] justify-center gap-1">
      {items.map((item) => (
        <div key={item.id}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};

export default CollectionGrid;
