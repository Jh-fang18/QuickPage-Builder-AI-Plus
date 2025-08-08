"use client";

import { useState, useEffect } from "react";

import CoreComponent from "./core";

import { ComponentItem } from "../../types/common";
import EditContext from "./context";

export default function Page() {
  const [activatedComponents, setActivatedComponents] = useState<
    ComponentItem[]
  >([]);

  const DynamicComponents = [
    {
      Name: "index",
      Props: {
        terminalType: 0,
        gridRow: 36,
        gridColumn: 24,
        gridScale: 30,
        gridPadding: 20,
      },
    },
  ];

  useEffect(() => {
    setActivatedComponents([
      {
        title: "LaunchTicket",
        key: "4_me0z2326hh5wezt0joe",
        url: "LaunchTicket",
        minWidth: 8,
        minHeight: 6,
        width: 8,
        height: 6,
        editTitle: false,
        positionX: 0,
        positionY: 0,
        menuKey: "4",
        ccs: "1/1/7/9",
        rowIndex: 0,
        selfServiceData: {
          id: 4,
          itemName: "LaunchTicket",
          url: "LaunchTicket",
          props: {
            
          },

        },
        props: {
        },
      },
    ]);
  }, []);

  return (
    <EditContext.Provider
      value={{ activatedComponents, setActivatedComponents }}
    >
      <CoreComponent {...(DynamicComponents[0].Props as any)} />
    </EditContext.Provider>
  );
}
