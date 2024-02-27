"use client";

import React, { useMemo } from "react";
import { Rows2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ElementsType,
  PageElement,
  PageElementInstance,
} from "../PageElements";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  AnimateLayoutChanges,
  arrayMove,
  defaultAnimateLayoutChanges,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SortableItem, Item } from "./SortableItem";
import { Container } from "./SortableContainer";
import useDesigner from "../hooks/useDesigner";

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

interface Items {
  id: UniqueIdentifier;
}

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: PageElementInstance;
}) {
  const { elements } = useDesigner();
  const element = elementInstance as CustomInstance;
  const { label, children } = element.extraAttributes;

  const containerDroppable = useDroppable({
    id: element.id,
    data: {
      type: element.type,
      accept: ["Column"],
      children,
    },
  });

  const items = useMemo(
    () =>
      children
        .map((childId: UniqueIdentifier) =>
          elements
            .filter((el) => el.id === childId)
            .find((element) => element.type === "Column")
        )
        .filter((item): item is PageElementInstance => item !== undefined),
    [children, elements]
  );

  const itemIds = useMemo(
    () => items.map((item) => item.id),
    [items]
  ) as UniqueIdentifier[];

  return (
    <SortableItem id={element.id}>
      <Container ref={containerDroppable.setNodeRef}>
        <SortableContext
          items={itemIds}
          strategy={horizontalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              <Item id={item.id} />
            </SortableItem>
          ))}
        </SortableContext>
      </Container>
    </SortableItem>
  );
}
