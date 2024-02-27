"use client";

import React, { useMemo } from "react";
import { Columns2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ElementsType,
  PageElement,
  PageElementInstance,
} from "../PageElements";
import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import {
  AnimateLayoutChanges,
  arrayMove,
  defaultAnimateLayoutChanges,
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
      accept: ["Row", "TextField", "SelectField"],
      children,
    },
  });

  const items = useMemo(
    () =>
      children
        .map((childId: UniqueIdentifier) =>
          elements
            .filter((el) => el.id === childId)
            .find(
              (element) =>
                element.type === "Row" ||
                element.type === "TextField" ||
                element.type === "SelectField"
            )
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
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item?.id} id={item?.id}>
              <Item id={item?.id} />
            </SortableItem>
          ))}
        </SortableContext>
      </Container>
    </SortableItem>
  );
}
