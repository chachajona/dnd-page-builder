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
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ children, row, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`p-5 border-dashed border-2 rounded-sm ${
          row ? "flex flex-row" : "flex flex-col"
        }`}
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
}

export const SortableContainer: React.FC<SortableContainerProps> = ({
  id,
  row,
  getItems,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  const items = getItems(id);
  const itemIds = items.map((item) => item.id);

  return (
    <SortableItem id={id}>
      <div
        ref={setNodeRef}
        className={`p-5 border-dashed border-2 rounded-sm ${
          row ? "flex flex-row" : "flex flex-col"
        } ${isOver ? "bg-gray-300" : ""}`}
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
      </div>
    </SortableItem>
  );
};
