import React from "react";
import { PageElement, PageElementInstance } from "../PageElements";
import { Button } from "../ui/button";
import useDesigner from "../hooks/useDesigner";
import idGenerator from "@/lib/idGenerator";

const TreeItemBtn = ({
  pageElement,
  addElement,
}: {
  pageElement: PageElement;
  addElement: (index: number, element: PageElementInstance) => void;
}) => {
  const { elements } = useDesigner();
  const { label, icon: Icon } = pageElement.designerBtnElement;
  const createTreeItem = () => {
    const newElement = pageElement.construct(idGenerator());
    addElement(elements.length, newElement);
  };
  return (
    <Button
      className="flex flex-col gap-2 h-[90px] w-[90px] cursor-pointer"
      variant={"outline"}
      onClick={() => createTreeItem()}
    >
      <Icon className="h-8 w-8 text-primary cursor-pointer" />
      <p className="text-xs">{label}</p>
    </Button>
  );
};

export default TreeItemBtn;
