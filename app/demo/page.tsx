"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import idGenerator from "@/lib/idGenerator";
import { SortableItem } from "@/components/containers/SortableItem";
import { AddItems } from "@/components/containers/AddItems";

interface Item {
  id: string;
  name: string;
}

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [items, setItems] = useState<Item[]>([
    { name: "NextJS", id: "1693653637084" },
  ]);

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);

        return arrayMove(prevItems, oldIndex, newIndex);
      });
    }
  }

  function handleDelete(idToDelete: string) {
    setItems((prevItems) => prevItems.filter((item) => item.id !== idToDelete));
  }

  let id = idGenerator();
  function addNewItem(newItem: string) {
    setItems((prevItems) => [...prevItems, { name: newItem, id: id }]);
  }

  return (
    <main className="flex justify-center items-center h-screen px-2 mx-auto select-none">
      <Card className="w-full md:max-w-lg">
        <CardHeader className="space-y-1 ">
          <CardTitle className="text-2xl flex justify-between">
            Container
            <AddItems addNewItem={addNewItem} />
          </CardTitle>
          <CardDescription>List Items</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id} />
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </main>
  );
};

export default Home;
