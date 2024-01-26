"use client";

import React, { useCallback, useState } from "react";
import { RxContainer } from "react-icons/rx";
import {
  ElementsType,
  PageElement,
  PageElementInstance,
  SubmitFunction,
} from "../PageElements";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  DragOverlay,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddItems } from "./AddItems";
import { Container, SortableContainer } from "./SortableContainer";
import { Item, SortableItem } from "./SortableItem";
import ReactJson from "react-json-view";
import useDesigner from "../hooks/useDesigner";

const type: ElementsType = "Container";

const extraAttributes = {
  label: "Container",
  children: [],
};

export const ContainerPageElement: PageElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: RxContainer,
    label: "Container",
  },
  designerComponent: DesignerComponent,
  pageComponent: PageComponent,
  propertiesComponent: PropertiesComponent,
  jsonPropertiesComponent: PropertiesComponent,
  validate: () => true,
};

type CustomInstance = PageElementInstance & {
  extraAttributes: typeof extraAttributes;
};

interface Item {
  id: UniqueIdentifier;
  container?: boolean;
  row?: boolean;
  parent?: UniqueIdentifier | false;
}

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: PageElementInstance;
}) {
  const element = elementInstance as CustomInstance;

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const { label, children } = element.extraAttributes;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addItems = useCallback(
    (container?: boolean, row?: boolean) => {
      setItems((prev) => [
        ...prev,
        {
          id: `item-${prev.length + 1}`,
          container,
          row,
        },
      ]);
    },
    [setItems]
  );

  function isContainer(id: UniqueIdentifier) {
    const item = items.find((item) => item.id === id);
    return !item ? false : item.container;
  }

  function isRow(id: UniqueIdentifier) {
    const item = items.find((item) => item.id === id);
    return !item ? false : item.row;
  }

  function findParent(id: UniqueIdentifier) {
    const item = items.find((item) => item.id === id);
    return !item ? false : item.parent;
  }

  function getItems(parent?: UniqueIdentifier) {
    return items.filter((item) => {
      if (!parent) {
        return !item.parent;
      }
      return item.parent === parent;
    });
  }

  function getItemIds(parent?: UniqueIdentifier) {
    return getItems(parent).map((item) => item.id);
  }

  function getDragOverlay() {
    if (!activeId) {
      return null;
    }

    if (isContainer(activeId)) {
      const item = items.find((i) => i.id === activeId);

      if (item) {
        return (
          <Container row={item?.row}>
            {getItems(activeId).map((item) => (
              <Item key={item.id} id={item.id} />
            ))}
          </Container>
        );
      }
    }

    return <Item id={activeId} />;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const id = active.id;
    const overId = over?.id;

    if (!overId) return;

    const overParent = findParent(overId);
    const overIsContainer = isContainer(overId);
    const activeIsContainer = isContainer(String(activeId));

    if (overIsContainer) {
      const overIsRow = isRow(overId);
      const activeIsRow = isRow(String(activeId));

      if (overIsRow) {
        if (activeIsRow) {
          return;
        }

        if (!activeIsContainer) {
          return;
        }
      } else if (activeIsContainer) {
        return;
      }
    }

    setItems((prevItems) => {
      const activeIndex = prevItems.findIndex((item) => item.id === id);
      const overIndex = prevItems.findIndex((item) => item.id === overId);
      const activeTop = active.rect.current.translated?.top ?? 0;

      let newIndex = overIndex;

      const isBelowLastItem =
        over &&
        overIndex === prevItems.length - 1 &&
        activeTop > over.rect.top + over.rect.height;

      const modifier = isBelowLastItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : prevItems.length + 1;

      let nextParent;
      if (overId) {
        nextParent = overId && (overIsContainer ? overId : overParent);
      }

      prevItems[activeIndex].parent = nextParent;

      return arrayMove(prevItems, activeIndex, newIndex);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const id = active.id;
    const overId = over?.id;

    if (!overId) return;

    const activeIndex = items.findIndex((item) => item.id === id);
    const overIndex = items.findIndex((item) => item.id === overId);

    let newIndex = overIndex >= 0 ? overIndex : 0;

    if (activeIndex !== overIndex) {
      setItems((prevItems) => {
        const nextItems = arrayMove(prevItems, activeIndex, newIndex);
        return nextItems;
      });
    }

    setActiveId(null);
  }

  return (
    <div>
      <Card className="h-full w-full pt-7">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl flex justify-between">
            {label}
            <AddItems addNewItem={addItems} />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              id="root"
              items={getItemIds()}
              strategy={verticalListSortingStrategy}
            >
              {getItems().map((item) => {
                if (item.container) {
                  return (
                    <SortableContainer
                      key={item.id}
                      id={item.id}
                      getItems={getItems}
                      row={item.row}
                    />
                  );
                }

                return (
                  <SortableItem key={item.id} id={item.id}>
                    <Item id={item.id} />
                  </SortableItem>
                );
              })}
            </SortableContext>
            <DragOverlay>{getDragOverlay()}</DragOverlay>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
}

function PageComponent({
  elementInstance,
  submitValue,
}: {
  elementInstance: PageElementInstance;
  submitValue?: SubmitFunction;
}) {
  return <></>;
}

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: PageElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();

  const handleEdit = (editedJson: Record<string, any>) => {
    updateElement(element.id, {
      ...element,
      extraAttributes: editedJson,
    });
  };

  return (
    <div>
      <ReactJson
        src={element.extraAttributes}
        onEdit={handleEdit}
        enableClipboard={false}
        displayDataTypes={false}
        displayObjectSize={false}
        iconStyle="circle"
        style={{
          padding: "10px",
          borderRadius: "4px",
          background: "#f8f8f8",
        }}
      />
    </div>
  );
}
