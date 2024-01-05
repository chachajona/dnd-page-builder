"use client";

import React from "react";
import { PageElementInstance } from "../PageElements";

type DesignerContextType = {
  elements: PageElementInstance[];
  addElement: (index: number, element: PageElementInstance) => void;
  removeElement: (id: string) => void;
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
  const addElement = (index: number, element: PageElementInstance) => {
    setElements((prev) => {
      const newElements = [...prev];
      newElements.splice(index, 0, element);
      return newElements;
    });
  };
  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((element) => element.id !== id));
  };
  return (
    <DesignerContext.Provider value={{ elements, addElement, removeElement }}>
      {children}
    </DesignerContext.Provider>
  );
};

export default DesignerContextProvider;
