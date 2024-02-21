import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import ListTreeItem from "./ListTreeItem";

const AddTreeItem = () => {
  const [open, setOpen] = React.useState(false);
  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={`${open ? "outline" : "ghost"}`}
          className={`flex flex-row justify-center items-center gap-2 ${
            open ? "animate-none" : "animate-pulse"
          } hover:animate-none`}
          onClick={handleClick}
        >
          <span className="text-muted-foreground text-sm">Add New Items</span>
          <Plus className="h-4 w-4 text-muted-foreground text-sm" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="sm:max-w-[845px] sm:max-h-[500px]">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              Add Items or Rows or Columns
            </h4>
            <p className="text-sm text-muted-foreground">
              Set the number of items or rows or columns you want
            </p>
          </div>
          <ListTreeItem />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddTreeItem;
