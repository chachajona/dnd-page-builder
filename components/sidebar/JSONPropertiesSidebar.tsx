import React from "react";
import useDesigner from "../hooks/useDesigner";
import PageElements from "../PageElements";
import { Button } from "../ui/button";
import { AiOutlineClose } from "react-icons/ai";
import { Separator } from "../ui/separator";

const JSONPropertiesSidebar = () => {
  const { selectedElement, setSelectedElement } = useDesigner();
  if (!selectedElement)
    return (
      <aside className="w-[300px] max-w-[300px] flex flex-col flex-grow gap-2 border-r-2 border-muted p-4 bg-background overflow-y-auto h-full">
        <div className="flex justify-between items-center">
          <p className="text-sm text-foreground/70">JSON properties</p>
        </div>
      </aside>
    );
  const JSONPropertiesPage =
    PageElements[selectedElement?.type].jsonPropertiesComponent;
  
  return (
    <aside className="w-[300px] max-w-[300px] flex flex-col flex-grow gap-2 border-r-2 border-muted p-4 bg-background overflow-y-auto h-full">
      <div className="flex justify-between items-center">
        <p className="text-sm text-foreground/70">JSON properties</p>
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={() => {
            setSelectedElement(null);
          }}
        >
          <AiOutlineClose className="w-4 h-4" />
        </Button>
      </div>
      <Separator className="mb-4" />
      <JSONPropertiesPage elementInstance={selectedElement} />
    </aside>
  );
};

export default JSONPropertiesSidebar;
