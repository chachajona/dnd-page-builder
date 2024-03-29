"use client";

import React from "react";
import PreviewDialogBtn from "./buttons/PreviewDialogBtn";
import SavePageBtn from "./buttons/SavePageBtn";
import PublishPageBtn from "./buttons/PublishPageBtn";
import Designer from "./Designer";
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import DragOverlayWrapper from "./DragOverlayWrapper";

const PageBuilder = () => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 300,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);
  return (
    <DndContext sensors={sensors}>
      <main className="flex flex-col w-full">
        <div className="flex justify-between border-b-2 p-4 gap-3 items-center">
          <h2 className="truncate font-medium">
            <span className="text-muted-foreground mr-2"> Page </span>
          </h2>
          <div className="flex items-center gap-2 ">
            <PreviewDialogBtn />
            <SavePageBtn />
            <PublishPageBtn />
          </div>
        </div>
        <div className="flex w-full flex-grow items-center justify-center relative overflow-y-auto h-[100vh] bg-accent bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]">
          <Designer />
        </div>
      </main>
      <DragOverlayWrapper />
    </DndContext>
  );
};

export default PageBuilder;
