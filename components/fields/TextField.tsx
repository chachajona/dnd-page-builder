"use client";

import React from "react";

import { ElementsType, PageElement } from "../PageElements";
import { MdTextFields } from "react-icons/md";

const type: ElementsType = "TextField";

export const TextFieldFormElement: PageElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes: {
      label: "TextField",
      helperText: "HelperText",
      required: false,
      placeholder: "Value here ...",
    },
  }),
  designerBtnElement: {
    icon: MdTextFields,
    label: "TextField",
  },
  designerComponent: () => <div>Designer Component</div>,
  pageComponent: () => <div>Page Component</div>,
  propertiesComponent: () => <div>Properties Component</div>,
};
