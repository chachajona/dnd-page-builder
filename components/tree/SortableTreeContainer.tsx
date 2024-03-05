import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { ForwardedRef, forwardRef, useMemo } from "react";
import { SortableTreeItem, TreeItem } from "./SortableTreeItem";

interface TreeContainerProps {
  children?: React.ReactNode;
  row?: boolean;
  style?: React.CSSProperties;
}
export const TreeContainer = forwardRef(function TreeContainer(
  props: TreeContainerProps,
  ref: ForwardedRef<HTMLDivElement>
): React.ReactElement {
  const { row, children, style = {} } = props;
  return (
    <div
      ref={ref}
      className={`w-full p-[50px] min-h-50 border-dashed border-2 rounded-sm ${
        row ? "flex flex-row gap-2" : "flex flex-col gap-2"
      }`}
      style={{ ...style }}
    >
      {children}
    </div>
  );
});

interface SortableTreeContainerProps {
  id: UniqueIdentifier;
  row?: boolean;
  getItems: (
    id: UniqueIdentifier
  ) => { id: UniqueIdentifier; container?: boolean; row?: boolean }[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const SortableTreeContainer: React.FC<SortableTreeContainerProps> = ({
  id,
  row,
  getItems,
  style = {},
}): React.ReactElement => {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  const items = useMemo(() => getItems(id), [getItems, id]);
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  return (
    <TreeContainer
      ref={setNodeRef}
      row={row}
      style={{
        ...style,
      }}
    >
      <SortableContext
        items={itemIds}
        strategy={
          row ? horizontalListSortingStrategy : verticalListSortingStrategy
        }
        id={String(id)}
      >
        {items.map((item) => {
          if (item.container) {
            return (
              <SortableTreeContainer
                key={item.id}
                id={item.id}
                getItems={getItems}
                row={item.row}
              />
            );
          }
          return (
            <SortableTreeItem key={item.id} id={item.id}>
              <TreeItem id={item.id} />
            </SortableTreeItem>
          );
        })}
      </SortableContext>
    </TreeContainer>
  );
};

export default SortableTreeContainer;
