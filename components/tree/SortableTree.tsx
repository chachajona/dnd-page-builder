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

  const getContainerId = useCallback(
    function getContainerId(itemId: UniqueIdentifier) {
      const container = elements.find((element) =>
        element.extraAttributes?.containerId?.includes(itemId)
      );
      return container?.id || "root";
    },
    [elements]
  );

  function updateContainerId(id: UniqueIdentifier, newId: UniqueIdentifier) {
    updateElement(id, {
      ...elements.find((element) => element.id === id)!,
      extraAttributes: {
        ...elements.find((element) => element.id === id)!.extraAttributes,
        containerId: newId,
      },
    });

    setItems((prev) => ({
      ...prev,
      [newId]: [...(prev[newId] || []), id],
    }));
  }

  //Function called when a drag operation starts
  function onDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;
    setActiveId(id);
  }

  //Function called when a drag operation ends
  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const id = active.id;
    const overId = over?.id;

    if (!overId) {
      setActiveId(null);
      return;
    }

    const activeIndex = getIndex(id);
    const overIndex = getIndex(overId);

    const activeContainerId = getContainerId(id);
    const overContainerId = getContainerId(overId);

    // Move the activeId to the new position in the state.
    setItems((prevItems) => {
      const newItems = { ...prevItems };
      // Remove from the previous container.
      newItems[activeContainerId] = newItems[activeContainerId].filter(
        (item) => item !== id
      );

      // Insert into the new container at the correct index.
      const startOfOverItems = newItems[overContainerId].slice(0, overIndex);
      const endOfOverItems = newItems[overContainerId].slice(overIndex);
      newItems[overContainerId] = [...startOfOverItems, id, ...endOfOverItems];

      return newItems;
    });

    // Update container ID after move if needed.
    if (activeContainerId !== overContainerId) {
      const elementToUpdate = elements.find((el) => el.id === id);
      if (elementToUpdate) {
        updateElement(id, {
          ...elementToUpdate,
          extraAttributes: {
            ...(elementToUpdate.extraAttributes || {}),
            containerId: overContainerId,
          },
        });
      }
    }

    setActiveId(null); //Clear the active id when the drag operation ends
  }

  //Function called when a drag operation is cancelled
  function onDragCancel(event: DragCancelEvent) {
    const { active } = event;
    if (!active) {
      return;
    }
    setActiveId(null); //Clear the active id when the drag operation is cancelled
  }

  //Function called when a drag operation is over
  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const id = active.id;
    const overId = over?.id;

    if (!overId) return;

    const activeIndex = getIndex(id);
    const overIndex = getIndex(overId);

    const activeContainerId = getContainerId(id);
    const overContainerId = getContainerId(overId);

    if (activeContainerId !== overContainerId) {
      updateContainerId(id, overContainerId);
    }

    if (items[id] && activeContainerId !== overContainerId) {
      setItems((prevItems) => {
        const updatedItems = { ...prevItems };
        updatedItems[overId] = updatedItems[overId] || [];

        // Remove the active container's children from the active container
        updatedItems[id].forEach((childId) => {
          updatedItems[overId].push(childId);
        });

        // Update the parent property of the active container's children
        updatedItems[id] = [];

        return updatedItems;
      });
    }

    const activeElement = elements.find((element) => element.id === activeId);
    const overElement = elements.find((element) => element.id === overId);

    const activeIsContainer =
      activeElement?.type === "Column" || activeElement?.type === "Row";
    const overIsContainer =
      overElement?.type === "Column" || overElement?.type === "Row";

    if (activeIsContainer) {
      const overIsRow = overElement?.type === "Row";
      const activeIsRow = activeElement?.type === "Row";

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

    let newIndex = overIndex;

    // If both active and over elements are containers, do not change the index
    if (activeIsContainer && overIsContainer) {
      newIndex = activeIndex;
    } else if (activeIsContainer && !overIsContainer) {
      // If active is container but over is not, place active before the over element
      newIndex = overIndex;
    } else if (!activeIsContainer && overIsContainer) {
      // If active is not container but over is, place active after the over element
      newIndex = overIndex + 1;
    } else {
      // If both active and over elements are not containers, place active before the over element
      newIndex = overIndex;
    }

    setItems((prevItems) => {
      const updatedItems = { ...prevItems };
      updatedItems[activeContainerId] = arrayMove(
        updatedItems[activeContainerId],
        activeIndex,
        newIndex
      );
      return updatedItems;
    });
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
            animateLayoutChanges={animateLayoutChanges}
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
            animateLayoutChanges={animateLayoutChanges}
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
            animateLayoutChanges={animateLayoutChanges}
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
            containerId={getContainerId(id)}
            animateLayoutChanges={animateLayoutChanges}
          />
        );
      }

      return null;
    },
    [items, elements, getContainerId]
  );

  const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({ ...args, wasDragging: true });

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimationSideEffects,
    duration: 250,
    easing: "ease-out",
  };

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
                  <DragOverlay dropAnimation={dropAnimation}>
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
  animateLayoutChanges,
}: {
  element: PageElementInstance;
  id: UniqueIdentifier;
  containerId?: UniqueIdentifier;
  animateLayoutChanges: AnimateLayoutChanges;
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
  animateLayoutChanges,
}: {
  id: UniqueIdentifier;
  element: PageElementInstance;
  items: React.ReactNode[] | null;
  containerId?: UniqueIdentifier;
  animateLayoutChanges: AnimateLayoutChanges;
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
