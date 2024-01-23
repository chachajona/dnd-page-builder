import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";

interface ItemProps {
  id: UniqueIdentifier;
}

export const Item: React.FC<ItemProps> = ({ id }) => {
  return (
    <div className="flex w-full h-[50px] justify-center items-center bg-white m-2 border-2 border-solid border-[#9a9a9a] rounded-md">
      {id}
    </div>
  );
};

interface SortableItemProps {
  id: UniqueIdentifier;
  handlePosition?: "right" | "top";
  children?: React.ReactNode;
}

export const SortableItem: React.FC<SortableItemProps> = memo(
  ({ id, handlePosition = "right", children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: id });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      flex: 1,
      position: "relative",
    };

    let handleStyle: React.CSSProperties = {
      position: "absolute",
      fontSize: 36,
      color: "black",
      cursor: "grab",
    };

    const rightHandleStyle: React.CSSProperties = {
      right: 25,
      top: 0,
      bottom: 0,
      transform: "rotate(90deg)",
    };

    const topHandleStyle: React.CSSProperties = {
      right: 40,
      top: 0,
    };

    if (handlePosition === "right") {
      handleStyle = {
        ...handleStyle,
        ...rightHandleStyle,
      };
    } else if (handlePosition === "top") {
      handleStyle = {
        ...handleStyle,
        ...topHandleStyle,
      };
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
        {/* <div style={handleStyle}>{handlePosition}</div> */}
      </div>
    );
  }
);

SortableItem.displayName = "SortableItem";
