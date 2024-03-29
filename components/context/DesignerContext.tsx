"use client";

import React, { Dispatch, SetStateAction } from "react";
import { PageElementInstance } from "../PageElements";
import { UniqueIdentifier } from "@dnd-kit/core";

type DesignerContextType = {
  elements: PageElementInstance[];
  setElements: Dispatch<SetStateAction<PageElementInstance[]>>;
  addElement: (index: number, element: PageElementInstance) => void;
  removeElement: (id: UniqueIdentifier) => void;
  selectedElement: PageElementInstance | null;
  setSelectedElement: Dispatch<SetStateAction<PageElementInstance | null>>;
  updateElement: (id: UniqueIdentifier, element: PageElementInstance) => void;
};

export const DesignerContext = React.createContext<DesignerContextType | null>(
  null
);

const DesignerContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [elements, setElements] = React.useState<PageElementInstance[]>([]);
  const [selectedElement, setSelectedElement] =
    React.useState<PageElementInstance | null>(null);
  const addElement = (index: number, element: PageElementInstance) => {
    setElements((prev) => {
      const newElements = [...prev];
      newElements.splice(index, 0, element);
      return newElements;
    });
  };
  const removeElement = (id: UniqueIdentifier) => {
    setElements((prev) => prev.filter((element) => element.id !== id));
  };
  const updateElement = (
    id: UniqueIdentifier,
    element: PageElementInstance
  ) => {
    setElements((prev) => {
      const newElements = [...prev];
      const index = newElements.findIndex((el) => el.id === id);
      newElements[index] = element;
      return newElements;
    });
  };
  return (
    <DesignerContext.Provider
      value={{
        elements,
        setElements,
        addElement,
        removeElement,
        selectedElement,
        setSelectedElement,
        updateElement,
      }}
    >
      {children}
    </DesignerContext.Provider>
  );
};

export default DesignerContextProvider;
