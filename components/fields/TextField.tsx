"use client";

import React from "react";

import {
  ElementsType,
  PageElement,
  PageElementInstance,
} from "../PageElements";
import { MdTextFields } from "react-icons/md";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const type: ElementsType = "TextField";

const extraAttributes = {
  label: "TextField",
  helperText: "HelperText",
  required: false,
  placeholder: "Value here ...",
};

export const TextFieldFormElement: PageElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: MdTextFields,
    label: "TextField",
  },
  designerComponent: DesignerComponent,
  pageComponent: () => <div>Page Component</div>,
  propertiesComponent: () => <div>Properties Component</div>,
};

type CustomInstance = PageElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: PageElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { label, required, placeholder, helperText } = element.extraAttributes;
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label>
        {label}
        {required && "*"}
      </Label>
      <Input readOnly disabled placeholder={placeholder} />
      {helperText && (
        <p className="text-sm text-muted-foreground text-[0.8rem]">
          {helperText}
        </p>
      )}
    </div>
  );
}
