import { Active, DragOverlay, useDndMonitor } from "@dnd-kit/core";
import React from "react";
import PageElements, { ElementsType } from "./PageElements";
import { SidebarBtnElementOverlay } from "./sidebar/SidebarBtnElement";

const DragOverlayWrapper = () => {
  const [draggedItem, setDraggedItem] = React.useState<Active | null>(null);

  useDndMonitor({
    onDragStart(event) {
      setDraggedItem(event.active);
    },
    onDragCancel: () => {
      setDraggedItem(null);
    },
    onDragEnd: () => {
      setDraggedItem(null);
    },
  });

  if (!draggedItem) {
    return null;
  }

  let node = <div>No drag overlay</div>;
  const isSidebarBtnElement = draggedItem?.data?.current?.isDesignerBtnElement;

  if (isSidebarBtnElement) {
    const type = draggedItem?.data?.current?.type as ElementsType;
    node = <SidebarBtnElementOverlay pageElement={PageElements[type]} />;
  }
  return <DragOverlay>{node}</DragOverlay>;
};

export default DragOverlayWrapper;
