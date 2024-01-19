import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";

interface ItemProps {
  id: UniqueIdentifier;
}

export const Item: React.FC<ItemProps> = ({ id }) => {
  return (
    <div className="flex w-full h-[50px] justify-center items-center bg-white mx-[10px] ">
      {id}
    </div>
  );
};

interface SortableItemProps {
  id: UniqueIdentifier;
  children?: React.ReactNode;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Item id={id} />
    </div>
  );
};
