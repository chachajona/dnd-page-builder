import React, { useEffect, useMemo, useState } from "react";
import JSONPropertiesSidebar from "../sidebar/JSONPropertiesSidebar";
import useDesigner from "../hooks/useDesigner";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  rectSortingStrategy,
  AnimateLayoutChanges,
  NewIndexGetter,
  SortingStrategy,
} from "@dnd-kit/sortable";
import {
  Active,
  CollisionDetection,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  UniqueIdentifier,
  closestCenter,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  DropAnimation,
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
  DragCancelEvent,
  DragOverlay,
  DragOverEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import AddTreeItem from "./AddTreeItem";
import { Items } from "../../types/types";
import PageElements, { PageElementInstance } from "../PageElements";
import PropertiesPageSidebar from "../sidebar/PropertiesPageSidebar";
import { Button } from "../ui/button";
import { BiSolidTrash } from "react-icons/bi";
import { createRange } from "@/lib/createRange";

interface Props {
  collisionDetection?: CollisionDetection;
  getNewIndex?: NewIndexGetter;
  items?: UniqueIdentifier[];
  itemCount?: number;
  strategy?: SortingStrategy;
}

const SortableTree = ({
  collisionDetection = closestCenter,
  getNewIndex,
  items: initialItems,
  itemCount = 10,
}: Props) => {
  const { elements } = useDesigner();
  const [items, setItems] = useState<UniqueIdentifier[]>(
    initialItems ??
      createRange<UniqueIdentifier>(itemCount, (index) => index + 1)
  );
  const itemsId = useMemo(
    () => elements.map((element) => element.id),
    [elements]
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  useEffect(() => {
    setItems(elements.map((element) => element.id));
  }, [elements]);

  const sensor = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const getIndex = (id: UniqueIdentifier) => items.indexOf(id);

  function isColumn(id: UniqueIdentifier) {
    const element = elements.find((element) => element.id === id);
    return !element ? false : element.type === "Column";
  }

  function isRow(id: UniqueIdentifier) {
    const element = elements.find((element) => element.id === id);
    return !element ? false : element.type === "Row";
  }

  function findContainer(id: UniqueIdentifier) {}

  function onDragStart(event: DragStartEvent) {
    const { active } = event;
    if (!active) {
      return;
    }
    setActiveId(active.id);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over) {
      return;
    }
    const activeIndex = getIndex(active.id);
    const overIndex = getIndex(over.id);
    if (activeIndex !== overIndex) {
      setItems((items) => arrayMove(items, activeIndex, overIndex));
    }
  }

  function onDragCancel(event: DragCancelEvent) {
    const { active } = event;
    if (!active) {
      return;
    }
    setActiveId(null);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!active || !over) {
      return;
    }
    const activeIndex = getIndex(active.id);
    const overIndex = getIndex(over.id);
    if (activeIndex !== overIndex) {
      setActiveId(over.id);
    }
  }
  return (
    <DndContext
      sensors={sensor}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      onDragOver={onDragOver}
    >
      <div className="flex w-full h-full">
        <div className="p-4 w-full">
          <div className="bg-background max-w-[1200px] h-full m-auto rounded-xl flex flex-col flex-grow items-center justify-start flex-1 overflow-y-auto">
            <div className="p-4 w-full">
              {elements.length > 0 && (
                <div className="flex flex-col w-full gap-2">
                  <SortableContext
                    id="root"
                    items={itemsId}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((item) => (
                      <DesignerElementWrapper
                        id={item}
                        key={item}
                        element={
                          elements.find((element) => element.id === item)!
                        }
                      />
                    ))}
                  </SortableContext>
                  <DragOverlay>
                    {activeId && (
                      <DesignerElementWrapper
                        id={activeId}
                        key={activeId}
                        element={
                          elements.find((element) => element.id === activeId)!
                        }
                      />
                    )}
                  </DragOverlay>
                </div>
              )}
              <div className="flex justify-center items-center h-[120px] rounded-md bg-transparent border-dashed border-2">
                <AddTreeItem />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <PropertiesPageSidebar />
          <JSONPropertiesSidebar />
        </div>
      </div>
    </DndContext>
  );
};

function DesignerElementWrapper({
  element,
  id,
}: {
  element: PageElementInstance;
  id: UniqueIdentifier;
}) {
  const { removeElement, setSelectedElement } = useDesigner();
  const DesignerElement = PageElements[element.type].designerComponent;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      data: {
        type: "item",
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCursorGrabbing = attributes["aria-pressed"];

  if (element.type === "Container") {
    return (
      <div
        className="relative h-full flex flex-col text-foreground hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement(element);
        }}
        ref={setNodeRef}
        style={style}
        {...attributes}
      >
        <div>
          <DesignerElement elementInstance={element} />
          <div className="group flex justify-center items-center gap-0 absolute top-2 right-2">
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={(e) => {
                e.stopPropagation();
                removeElement(element.id);
              }}
              className="flex justify-center rounded-md group-hover:visible hover:bg-red-500 invisible"
            >
              <BiSolidTrash />
            </Button>
            <Button
              variant={"ghost"}
              size={"icon"}
              {...listeners}
              className={` ${
                isCursorGrabbing ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <svg viewBox="0 0 20 20" width="15">
                <path
                  d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"
                  fill="currentColor"
                ></path>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex w-full h-full items-center rounded-md bg-accent/40 px-4 py-2 hover:cursor-pointer opacity-100"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement(element);
      }}
      {...attributes}
      {...listeners}
    >
      <DesignerElement elementInstance={element} />
    </div>
  );
}

export default SortableTree;
