"use client";

import React from "react";
import DesignerSidebar from "./sidebar/DesignerSidebar";
import {
  useDndMonitor,
  useDroppable,
  DragEndEvent,
  useDraggable,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import PageElements, {
  ElementsType,
  PageElementInstance,
} from "./PageElements";
import useDesigner from "./hooks/useDesigner";
import idGenerator from "@/lib/idGenerator";
import { Button } from "./ui/button";
import { BiSolidTrash } from "react-icons/bi";
import JSONPropertiesSidebar from "./sidebar/JSONPropertiesSidebar";

const Designer = () => {
  const {
    elements,
    addElement,
    selectedElement,
    setSelectedElement,
    removeElement,
  } = useDesigner();

  const droppable = useDroppable({
    id: "designer-drop-area",
    data: {
      isDesignerDropArea: true,
    },
  });

  useDndMonitor({
    onDragEnd: (event: DragEndEvent) => {
      const { active, over } = event;
      if (!active || !over) return;

      const isDesignerBtnElement = active.data?.current?.isDesignerBtnElement;
      const isDroppingOverDesignerDropArea =
        over.data?.current?.isDesignerDropArea;

      const droppingSidebarBtnOverDesignerDropArea =
        isDesignerBtnElement && isDroppingOverDesignerDropArea;

      // First scenario
      //If a sidebar button is dropped over a designated drop area, a new element is created based on the type of the button and added to the elements array.
      if (droppingSidebarBtnOverDesignerDropArea) {
        const type = active.data?.current?.type;
        const newElement = PageElements[type as ElementsType].construct(
          idGenerator()
        );

        addElement(elements.length, newElement);
        return;
      }

      const isDroppingOverDesignerElementTopHalf =
        over.data?.current?.isTopHalfDesignerElement;

      const isDroppingOverDesignerElementBottomHalf =
        over.data?.current?.isBottomHalfDesignerElement;

      const isDroppingOverDesignerElement =
        isDroppingOverDesignerElementTopHalf ||
        isDroppingOverDesignerElementBottomHalf;

      const droppingSidebarBtnOverDesignerElement =
        isDesignerBtnElement && isDroppingOverDesignerElement;

      // Second scenario
      //If a sidebar button is dropped over a designer element (either the top half or the bottom half), a new element is created based on the type of the button and inserted at the appropriate index in the elements array.
      if (droppingSidebarBtnOverDesignerElement) {
        const type = active.data?.current?.type;
        const newElement = PageElements[type as ElementsType].construct(
          idGenerator()
        );

        const overId = over.data?.current?.elementId;

        const overElementIndex = elements.findIndex((el) => el.id === overId);
        if (overElementIndex === -1) {
          throw new Error("element not found");
        }

        let indexForNewElement = overElementIndex; // i assume i'm on top-half
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1;
        }

        addElement(indexForNewElement, newElement);
        return;
      }

      // Third scenario
      //If a designer element is being dragged and dropped over another designer element, the active element is moved to the appropriate index in the elements array.
      const isDraggingDesignerElement = active.data?.current?.isDesignerElement;

      const draggingDesignerElementOverAnotherDesignerElement =
        isDroppingOverDesignerElement && isDraggingDesignerElement;

      if (draggingDesignerElementOverAnotherDesignerElement) {
        const activeId = active.data?.current?.elementId;
        const overId = over.data?.current?.elementId;

        const activeElementIndex = elements.findIndex(
          (el) => el.id === activeId
        );

        const overElementIndex = elements.findIndex((el) => el.id === overId);

        if (activeElementIndex === -1 || overElementIndex === -1) {
          throw new Error("element not found");
        }

        const activeElement = { ...elements[activeElementIndex] };
        removeElement(activeId);

        let indexForNewElement = overElementIndex; // i assume i'm on top-half
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1;
        }

        addElement(indexForNewElement, activeElement);
      }

      // Fourth scenario
      //If a designer element is being dragged and dropped over the designer element container drop area, the active element is moved to the appropriate index in the elements array.
      const isDroppingOverContainerDropArea =
        over.data?.current?.isContainerDropArea;

      const draggingDesignerElementOverContainerDropArea =
        isDroppingOverContainerDropArea && isDraggingDesignerElement;

      if (draggingDesignerElementOverContainerDropArea) {
        const activeId = active.data?.current?.elementId;
        const overId = over.data?.current?.elementId;

        // Get the active element and move it to the container children array
        const activeElementIndex = elements.findIndex(
          (el) => el.id === activeId
        );

        const overElementIndex = elements.findIndex((el) => el.id === overId);

        if (activeElementIndex === -1 || overElementIndex === -1) {
          throw new Error("element not found");
        }

        const activeElement = { ...elements[activeElementIndex] };
        removeElement(activeId);

        if (elements[overElementIndex]) {
          const updatedOverElement = {
            ...elements[overElementIndex],
            extraAttributes: {
              ...(elements[overElementIndex].extraAttributes || {}),
              children: [
                ...(elements[overElementIndex].extraAttributes?.children || []),
                activeElement.extraAttributes,
              ],
            },
          };

          // Add the updated over element to the elements array
          addElement(overElementIndex, updatedOverElement);
          return;
        }
      }
    },
  });
  return (
    <div className="flex w-full h-full">
      <DesignerSidebar />
      <div
        className="p-4 w-full"
        onClick={() => {
          if (selectedElement) setSelectedElement(null);
        }}
      >
        <div
          ref={droppable.setNodeRef}
          className={cn(
            "bg-background max-w-[1200px] h-full m-auto rounded-xl flex flex-col flex-grow items-center justify-start flex-1 overflow-y-auto ",
            droppable.isOver && "ring-2 ring-primary ring-inset"
          )}
        >
          {!droppable.isOver && elements.length === 0 && (
            <p className="text-3xl text-muted-foreground flex flex-grow items-center font -bold ">
              Drop Here
            </p>
          )}
          {droppable.isOver && elements.length === 0 && (
            <div className="p-4 w-full">
              <div className="h-[120px] rounded-md bg-primary/20"></div>
            </div>
          )}
          {elements.length > 0 && (
            <div className="flex flex-col w-full gap-2 p-4">
              {elements.map((element) => (
                <DesignerElementWrapper key={element.id} element={element} />
              ))}
            </div>
          )}
        </div>
      </div>
      <JSONPropertiesSidebar />
    </div>
  );
};

function DesignerElementWrapper({ element }: { element: PageElementInstance }) {
  const { removeElement, selectedElement, setSelectedElement } = useDesigner();
  const [mouseIsOver, setMouseIsOver] = React.useState<boolean>(false);
  const topHalf = useDroppable({
    id: element.id + "-top",
    data: {
      type: element.type,
      elementId: element.id,
      isTopHalfDesignerElement: true,
    },
  });

  const bottomHalf = useDroppable({
    id: element.id + "-bottom",
    data: {
      type: element.type,
      elementId: element.id,
      isBottomHalfDesignerElement: true,
    },
  });

  const draggable = useDraggable({
    id: element.id + "-drag-handler",
    data: {
      type: element.type,
      elementId: element.id,
      isDesignerElement: true,
    },
  });

  console.log("SELECTED ELEMENT", selectedElement);
  const DesignerElement = PageElements[element.type].designerComponent;
  const isCursorGrabbing = draggable.attributes["aria-pressed"];
  {
    if (element.type === "Container") {
      return (
        <div
          ref={draggable.setNodeRef}
          className="relative h-full flex flex-col text-foreground hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset "
          onClick={(e) => {
            e.stopPropagation();
            setSelectedElement(element);
          }}
        >
          <div
            ref={topHalf.setNodeRef}
            className="absolute w-full h-[10%] rounded-t-md"
          />
          <div
            ref={bottomHalf.setNodeRef}
            className="absolute w-full bottom-0 h-[10%] rounded-b-md"
          />
          {topHalf.isOver && (
            <div className="absolute top-0 w-full rounded-md h-[7px] bg-primary rounded-b-none" />
          )}
          <div>
            <DesignerElement elementInstance={element} />
            <div className="flex justify-center items-center gap-0 absolute top-2 right-2">
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={(e) => {
                  e.stopPropagation(); //avoid selection of element while deleting
                  removeElement(element.id);
                }}
                className="group flex justify-center rounded-md group-hover:block hover:bg-red-500 "
              >
                <BiSolidTrash />
              </Button>
              <Button
                variant={"ghost"}
                size={"icon"}
                {...draggable.attributes}
                {...draggable.listeners}
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
          {bottomHalf.isOver && (
            <div className="absolute bottom-0 w-full rounded-md h-[7px] bg-primary rounded-t-none" />
          )}
        </div>
      );
    }
  }
  return (
    <div
      ref={draggable.setNodeRef}
      className="relative h-full flex flex-col text-foreground hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset "
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement(element);
      }}
      {...draggable.attributes}
      {...draggable.listeners}
    >
      <div
        ref={topHalf.setNodeRef}
        className="absolute w-full h-1/2 rounded-t-md"
      />
      <div
        ref={bottomHalf.setNodeRef}
        className="absolute w-full bottom-0 h-1/2 rounded-b-md"
      />
      {mouseIsOver && (
        <>
          <div className="absolute right-0 h-full">
            <Button
              className="flex justify-center h-full border rounded-md rounded-l-none bg-red-500"
              variant={"outline"}
              onClick={(e) => {
                e.stopPropagation(); //avoid selection of element while deleting
                removeElement(element.id);
              }}
            >
              <BiSolidTrash className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse">
            <p className="text-muted-foreground text-sm ">
              Click for properties or drag to move
            </p>
          </div>
        </>
      )}
      {topHalf.isOver && (
        <div className="absolute top-0 w-full rounded-md h-[7px] bg-primary rounded-b-none" />
      )}
      <div
        className={cn(
          "flex w-full h-full items-center rounded-md bg-accent/40 px-4 py-2 pointer-events-none opacity-100",
          mouseIsOver && "opacity-10"
        )}
      >
        <DesignerElement elementInstance={element} />
      </div>
      {bottomHalf.isOver && (
        <div className="absolute bottom-0 w-full rounded-md h-[7px] bg-primary rounded-t-none" />
      )}
    </div>
  );
}

export default Designer;
