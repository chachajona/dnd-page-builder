import React, { forwardRef, ForwardedRef, useMemo } from "react";
import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Item, SortableItem } from "./SortableItem";

interface ContainerProps {
  children?: React.ReactNode;
  row?: boolean;
  style?: React.CSSProperties;
}

export const Container = forwardRef(function Container(
  props: ContainerProps,
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
interface SortableContainerProps {
  id: UniqueIdentifier;
  row?: boolean;
  getItems: (
    id: UniqueIdentifier
  ) => { id: UniqueIdentifier; container?: boolean; row?: boolean }[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
  handlePosition?: string;
}

export const SortableContainer: React.FC<SortableContainerProps> = ({
  id,
  row,
  getItems,
  style = {},
}): React.ReactElement => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      isContainerDropArea: true,
    },
  });

  const items = useMemo(() => getItems(id), [getItems, id]);
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  return (
    <SortableItem id={id} handlePosition="top">
      <Container
        ref={setNodeRef}
        row={row}
        style={{
          ...style,
          backgroundColor: isOver
            ? "rgb(241,245,249)"
            : row
            ? "rgb(241,245,249)"
            : "transparent",
        }}
      >
        <SortableContext
          items={itemIds}
          strategy={
            row ? horizontalListSortingStrategy : verticalListSortingStrategy
          }
        >
          {items.map((item) => {
            let child = <Item id={item.id} />;
            if (item.container) {
              return (
                <SortableContainer
                  key={item.id}
                  id={item.id}
                  getItems={getItems}
                  row={item.row}
                  handlePosition="top"
                />
              );
            }
            return (
              <SortableItem key={item.id} id={item.id}>
                {child}
              </SortableItem>
            );
          })}
        </SortableContext>
      </Container>
    </SortableItem>
  );
};
