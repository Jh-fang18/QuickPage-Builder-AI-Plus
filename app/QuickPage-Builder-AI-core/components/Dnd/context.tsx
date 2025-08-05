import { createContext } from "react";

import { ComponentItem } from "../types/dnd";

const EditContext = createContext<{
  activatedComponents: ComponentItem[];
  setActivatedComponents: React.Dispatch<React.SetStateAction<ComponentItem[]>>;
}>({    
  activatedComponents: [],
  setActivatedComponents: () => {},
});

export default EditContext;
