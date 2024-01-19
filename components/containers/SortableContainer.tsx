import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Item, SortableItem } from "./SortableItem";

interface ContainerProps {
  id: string;
  children?: React.ReactNode;
  row?: boolean;
  style?: React.CSSProperties;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ children, row, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`w-full p-5 border-dashed border-2 rounded-sm ${
          row ? "flex flex-row gap-2" : "flex flex-col gap-2"
        }`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
interface SortableContainerProps {
  id: string;
  row?: boolean;
  getItems: (
    id: string
  ) => { id: string; container?: boolean; row?: boolean }[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const SortableContainer: React.FC<SortableContainerProps> = ({
  id,
  row,
  getItems,
  style = {},
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  const items = getItems(id);
  const itemIds = items.map((item) => item.id);

  return (
    <SortableItem id={id} handlePosition={row ? "right" : "top"}>
      <Container
        id={id}
        ref={setNodeRef}
        row={row}
        style={{
          ...style,
          backgroundColor: isOver ? "rgb(241,245,249)" : row ? "rgb(241,245,249)" : "transparent",
        }}
      >
        <SortableContext
          items={itemIds}
          strategy={
            row ? horizontalListSortingStrategy : verticalListSortingStrategy
          }
        >
          {items.map((item) => {
            return item.container ? (
              <Container key={item.id} id={item.id} row={item.row} />
            ) : (
              <SortableItem key={item.id} id={item.id}>
                <Item id={item.id} />
              </SortableItem>
            );
          })}
        </SortableContext>
      </Container>
    </SortableItem>
  );
};
