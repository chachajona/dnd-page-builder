import React from "react";
import useDesigner from "../hooks/useDesigner";
import PageElements from "../PageElements";
import { Button } from "../ui/button";
import { AiOutlineClose } from "react-icons/ai";
import { Separator } from "../ui/separator";

const PropertiesPageSidebar = () => {
  const { selectedElement, setSelectedElement } = useDesigner();
  if (!selectedElement) return null;
  const PropertiesPage =
    PageElements[selectedElement?.type].propertiesComponent;
  return (
    <div className="flex flex-col p-2">
      <div className="flex justify-between items-center">
        <p className="text-sm text-foreground/70">Element properties</p>
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
      <PropertiesPage elementInstance={selectedElement} />
    </div>
  );
};

export default PropertiesPageSidebar;
