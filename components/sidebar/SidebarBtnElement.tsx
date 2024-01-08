import React from "react";
import { PageElement } from "../../components/PageElements";
import { Button } from "../ui/button";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

const SidebarBtnElement = ({ pageElement }: { pageElement: PageElement }) => {
  const { label, icon: Icon } = pageElement.designerBtnElement;
  const draggable = useDraggable({
    id: `designer-btn-${pageElement.type}`,
    data: {
      type: pageElement.type,
      isDesignerBtnElement: true,
    },
  });

  return (
    <Button
      ref={draggable.setNodeRef}
      className={cn(
        "flex flex-col gap-2 h-[100px] w-[100px] cursor-grab",
        draggable.isDragging && "ring-2 ring-primary"
      )}
      variant={"outline"}
      {...draggable.attributes}
      {...draggable.listeners}
    >
      <Icon className="h-8 w-8 text-primary cursor-grab" />
      <p className="text-xs">{label}</p>
    </Button>
  );
};

export const SidebarBtnElementOverlay = ({
  pageElement,
}: {
  pageElement: PageElement;
}) => {
  const { label, icon: Icon } = pageElement.designerBtnElement;

  return (
    <Button
      className="flex flex-col gap-2 h-[120px] w-[120px] cursor-grab"
      variant={"outline"}
    >
      <Icon className="h-8 w-8 text-primary cursor-grab" />
      <p className="text-xs">{label}</p>
    </Button>
  );
};

export default SidebarBtnElement;
