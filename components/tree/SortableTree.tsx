import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import JSONPropertiesSidebar from "../sidebar/JSONPropertiesSidebar";
import useDesigner from "../hooks/useDesigner";
//DnD
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
  defaultAnimateLayoutChanges,
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
import PageElements, {
  PageElementInstance,
  ElementsType,
} from "../PageElements";
import PropertiesPageSidebar from "../sidebar/PropertiesPageSidebar";
import { Button } from "../ui/button";
import { BiSolidTrash } from "react-icons/bi";
import { cn } from "@/lib/utils";

interface Props {
  collisionDetection?: CollisionDetection;
  items?: UniqueIdentifier[];
  strategy?: SortingStrategy;
}

const SortableTree = ({
  collisionDetection = closestCenter,
  items: initialItems,
}: Props) => {
  const { elements, updateElement, addElement, setElements } = useDesigner();
  // Maintain state for each container and the items they contain
  const [items, setItems] = useState<
    Record<UniqueIdentifier, UniqueIdentifier[]>
  >({
    root: [] as UniqueIdentifier[],
  });

  const itemsId = useMemo(() => [...items.root], [items]);

  const prevItemsRoot = useRef<UniqueIdentifier[]>(items.root);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const updateElements = useCallback(
    (sortedRootItems: UniqueIdentifier[]) => {
      const newElements = sortedRootItems
        .map((itemId) => {
          const element = elements.find((el) => el.id === itemId);
          if (element) {
            return element;
          }
          return null;
        })
        .filter(Boolean) as PageElementInstance[];
      // Update elements state with the new order
      setElements(newElements);
    },
    [elements, setElements]
  );

  useEffect(() => {
    const initialItemsState: Record<UniqueIdentifier, UniqueIdentifier[]> = {
      root: [] as UniqueIdentifier[],
    };

    elements.forEach((element) => {
      const { id, type, extraAttributes } = element;
      const { containerId, children } = extraAttributes || {};

      if (type === "Column" || type === "Row") {
        const parentContainerId = containerId;
        const childrenIds = children || [];

        if (parentContainerId && initialItemsState[parentContainerId]) {
          initialItemsState[parentContainerId].push(id);
        } else if (parentContainerId === "root" || parentContainerId === "") {
          initialItemsState["root"].push(id);
          updateElement(id, {
            ...element,
            extraAttributes: {
              ...extraAttributes,
              containerId: "root",
            },
          });
        }

        initialItemsState[id] = [];

        if (childrenIds.length > 0) {
          childrenIds.forEach((childId: UniqueIdentifier) => {
            initialItemsState[id].push(childId);
          });
        }
      }

      if (type === "TextField" || type === "SelectField") {
        const parentContainerId = containerId;
        if (parentContainerId && initialItemsState[parentContainerId]) {
          initialItemsState[parentContainerId].push(id);
        } else if (parentContainerId === "root" || parentContainerId === "") {
          initialItemsState["root"].push(id);
          updateElement(id, {
            ...element,
            extraAttributes: {
              ...extraAttributes,
              containerId: "root",
            },
          });
        }
      }
    });

    setItems(initialItemsState);
  }, [elements, updateElement]);

  useEffect(() => {
    if (JSON.stringify(items.root) !== JSON.stringify(prevItemsRoot.current)) {
      updateElements(items.root);
      prevItemsRoot.current = items.root;
    }
  }, [items.root, updateElements]);

  // Use the defined sensors for drag and drop operation
  const sensor = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        // Require mouse to move 5px to start dragging, this allow onClick to be triggered on click
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        // Require to press for 300ms to start dragging, this can reduce the chance of dragging accidentally due to page scroll
        delay: 300,
        // Require mouse to move 5px to start dragging, this allow onClick to be triggered on click
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const getIndex = (id: UniqueIdentifier) => {
    const container = findContainer(id);
    if (!container) {
      // Handle the case where containerItems is undefined
      return -1;
    }

    const index = items[container].indexOf(id);
    return index;
  };

  function getContainerId(itemId: UniqueIdentifier): UniqueIdentifier {
    const container = elements.find((element) =>
      element.extraAttributes?.containerId?.includes(itemId)
    );
    return container?.id || "root";
  }

  function onDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;
    setActiveId(id);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const id = active.id;
    const overId = over?.id;

    if (!overId) return;

    const activeIndex = getIndex(id);
    const overIndex = getIndex(overId);

    const activeContainerId = getContainerId(id);
    const overContainerId = getContainerId(overId);

    setItems((prevItems) => {
      const updatedItems = { ...prevItems };

      if (activeContainerId === overContainerId) {
        // Moving items within the same container
        updatedItems[activeContainerId] = arrayMove(
          updatedItems[activeContainerId],
          activeIndex,
          overIndex
        );
      } else {
        // Moving items between different containers
        updatedItems[activeContainerId] = updatedItems[
          activeContainerId
        ].filter((item) => item !== id);
        updatedItems[overContainerId] = [
          ...updatedItems[overContainerId].slice(0, overIndex),
          id,
          ...updatedItems[overContainerId].slice(overIndex),
        ];
      }

      return updatedItems;
    });
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

  function getDragOverlay() {
    if (!activeId) {
      return null;
    }

    const activeElement = elements.find((i) => i.id === activeId);
    if (activeElement) {
      if (
        activeElement.type === "TextField" ||
        activeElement.type === "SelectField"
      ) {
        return (
          <SortableItem
            key={activeId}
            id={activeId}
            element={activeElement}
            containerId={getContainerId(activeId)}
          />
        );
      }

      if (activeElement.type === "Column" || activeElement.type === "Row") {
        const children = items[activeId].map((childId) => {
          const childElement = elements.find((el) => el.id === childId);
          if (!childElement) return null;

          return renderElement(childElement);
        });
        return (
          <SortableContainer
            key={activeId}
            id={activeId}
            element={activeElement}
            items={children}
            containerId={getContainerId(activeId)}
          />
        );
      }
    }
  }

  const renderElement = useCallback(
    (element: PageElementInstance) => {
      const { id } = element;

      if (element.type === "TextField" || element.type === "SelectField") {
        const containerId = element.extraAttributes?.containerId || "root";
        return (
          <SortableItem
            key={id}
            id={id}
            element={element}
            containerId={containerId}
          />
        );
      }

      if (element.type === "Column" || element.type === "Row") {
        const children = items[id].map((childId) => {
          const childElement = elements.find((el) => el.id === childId);
          if (!childElement) return null;

          return renderElement(childElement);
        });

        return (
          <SortableContainer
            key={id}
            id={id}
            element={element}
            items={children}
          />
        );
      }

      return null;
    },
    [items, elements]
  );

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
                    {items.root.map((childId) => {
                      const childElement = elements.find(
                        (el) => el.id === childId
                      );
                      if (!childElement) return null;

                      return renderElement(childElement);
                    })}
                  </SortableContext>
                  <DragOverlay>
                    {activeId ? getDragOverlay() : null}
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

function SortableItem({
  element,
  id,
  containerId,
}: {
  element: PageElementInstance;
  id: UniqueIdentifier;
  containerId?: UniqueIdentifier;
}) {
  const { removeElement, setSelectedElement } = useDesigner();
  const DesignerElement = PageElements[element.type].designerComponent;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "item",
    },
  });

  const style = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCursorGrabbing = attributes["aria-pressed"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex h-full items-center rounded-md bg-accent/40 px-4 py-2 hover:cursor-pointer opacity-100"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement(element);
      }}
      {...attributes}
    >
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
          className={` ${isCursorGrabbing ? "cursor-grabbing" : "cursor-grab"}`}
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
  );
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function SortableContainer({
  id,
  element,
  items,
  containerId,
}: {
  id: UniqueIdentifier;
  element: PageElementInstance;
  items: React.ReactNode[] | null;
  containerId?: UniqueIdentifier;
}) {
  const { removeElement, setSelectedElement } = useDesigner();
  const DesignerElement = PageElements[element.type].designerComponent;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      accepts: ["item"],
      type: "container",
      children: items,
    },
    animateLayoutChanges,
  });

  const style = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCursorGrabbing = attributes["aria-pressed"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative h-full flex flex-col text-foreground hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement(element);
      }}
      {...attributes}
    >
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
          className={` ${isCursorGrabbing ? "cursor-grabbing" : "cursor-grab"}`}
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
  );
}

export default SortableTree;
