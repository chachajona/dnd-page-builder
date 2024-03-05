import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { FC } from "react";

export const TreeItem: FC<{
  id: UniqueIdentifier;
}> = ({ id }) => {
  return (
    <div className="flex w-full h-[50px] justify-center items-center bg-white m-2 border-2 border-solid border-[#9a9a9a] rounded-md">
      {id}
    </div>
  );
};

export const SortableTreeItem: FC<{
  id: UniqueIdentifier;
  children?: React.ReactNode;
}> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style = {
    // Use Translate instead of Transform if overlay is disabled
    // transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Transform.toString(transform),
    transition,
    // Prevent text selection during drag
    userSelect: "none" as "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* <TreeItem id={id} /> */}
      {children}
    </div>
  );
};
