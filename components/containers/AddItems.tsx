import { Button } from "@/components/ui/button";
import { Plus, Columns2, Rows2 } from "lucide-react";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface AddItemsProps {
  addNewItem: (row?: boolean, column?: boolean) => void;
}
export function AddItems({ addNewItem }: AddItemsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="sm:max-w-[425px]">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              Add Items or Rows or Columns
            </h4>
            <p className="text-sm text-muted-foreground">
              Set the number of items or rows or columns you want
            </p>
          </div>
          <div className="grid grid-cols-3">
            <Button
              variant={"outline"}
              className="w-full"
              onClick={() => addNewItem()}
            >
              <Columns2 className="h-6 w-6" />
              Items
            </Button>
            <Button
              variant={"outline"}
              className="w-full gap-2"
              onClick={() => addNewItem(true)}
            >
              <Columns2 className="h-6 w-6" />
              Columns
            </Button>
            <Button
              variant={"outline"}
              className="w-full gap-2"
              onClick={() => addNewItem(true, true)}
            >
              <Rows2 className="h-6 w-6" />
              Rows
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
