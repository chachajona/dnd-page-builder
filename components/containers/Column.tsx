"use client";

import React, { useMemo } from "react";
import { Columns2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ElementsType,
  PageElement,
  PageElementInstance,
} from "../PageElements";
import {
  DragEndEvent,
  UniqueIdentifier,
  useDndMonitor,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TreeContainer } from "../tree/SortableTreeContainer";
import useDesigner from "../hooks/useDesigner";
import { SortableTreeItem, TreeItem } from "../tree/SortableTreeItem";

const type: ElementsType = "Column";

const extraAttributes = {
  label: "Column",
  containerId: "",
  children: [] as UniqueIdentifier[],
};

export const ColumnPageElement: PageElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: Columns2,
    label: "Column",
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
      accepts: ["Row", "TextField", "SelectField"],
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
        row={false}
        style={{
          backgroundColor: "transparent",
        }}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableTreeItem key={item?.id} id={item?.id}>
              <TreeItem id={item?.id} />
            </SortableTreeItem>
          ))}
        </SortableContext>
      </TreeContainer>
    </SortableTreeItem>
  );
}
