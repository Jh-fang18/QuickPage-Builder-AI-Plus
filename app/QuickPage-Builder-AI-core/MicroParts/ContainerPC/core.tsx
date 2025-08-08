import { useContext } from "react";

import EditContext from "./context";

import ContainerPC from "./index";
import { ComponentItem } from "../../types/common";
import * as MicroCards from "../index";




export default function Page() {
  const { activatedComponents, setActivatedComponents } = useContext<{
    activatedComponents: ComponentItem[];
    setActivatedComponents: React.Dispatch<
      React.SetStateAction<ComponentItem[]>
    >;
  }>(EditContext);
  

  return (
      <ContainerPC
        gridRow={36}
        gridColumn={24}
        gridScale={30}
        gridPadding={20}
        MicroCards={MicroCards}

        activatedComponents={activatedComponents}
        setActivatedComponents={setActivatedComponents}
      />
  );
}
