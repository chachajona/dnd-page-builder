"use client";

import React, { useMemo } from "react";
import { Rows2 } from "lucide-react";
import {
  ElementsType,
  PageElement,
  PageElementInstance,
} from "../PageElements";
import {
  useDroppable,
  useDndMonitor,
  UniqueIdentifier,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { SortableTreeItem, TreeItem } from "../tree/SortableTreeItem";
import useDesigner from "../hooks/useDesigner";
import { TreeContainer } from "../tree/SortableTreeContainer";

const type: ElementsType = "Row";

const extraAttributes = {
  label: "Row",
  containerId: "",
  children: [] as UniqueIdentifier[],
};

export const RowPageElement: PageElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: Rows2,
    label: "Row",
  },
  designerComponent: DesignerComponent,
  pageComponent: () => <></>,
  propertiesComponent: () => <></>,
  jsonPropertiesComponent: () => <></>,
  validate: () => true,
};

type CustomInstance = PageElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: PageElementInstance;
}) {
  const { elements, updateElement } = useDesigner();
  const element = elementInstance as CustomInstance;
  const { children } = element.extraAttributes;

  const containerDroppable = useDroppable({
    id: element.id,
    data: {
      type: element.type,
      accepts: ["Column"],
      children,
      isContainerDroppableArea: true,
    },
  });

  const items = useMemo(
    () =>
      children
        .map((childId) => elements.find((el) => el.id === childId))
        .filter(Boolean) as PageElementInstance[],
    [children, elements]
  );

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  useDndMonitor({
    onDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      if (!active || !over) return;

      const activeId = active.id as UniqueIdentifier;
      const overId = over.data.current?.id;

      if (
        overId === element.id &&
        !element.extraAttributes.children.includes(activeId)
      ) {
        const newChildren = [...element.extraAttributes.children, activeId];
        updateElement(element.id, {
          ...element,
          extraAttributes: {
            ...element.extraAttributes,
            children: newChildren,
          },
        });
      }
    },
  });

  return (
    <SortableTreeItem id={element.id}>
      <TreeContainer
        ref={containerDroppable.setNodeRef}
        row={true}
        style={{ backgroundColor: "rgb(241,245,249)" }}
      >
        <SortableContext
          items={itemIds}
          strategy={horizontalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableTreeItem key={item.id} id={item.id}>
              <TreeItem id={item.id} />
            </SortableTreeItem>
          ))}
        </SortableContext>
      </TreeContainer>
    </SortableTreeItem>
  );
}

export default DesignerComponent;
