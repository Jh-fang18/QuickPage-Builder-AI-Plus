import { createContext } from "react";

import { ComponentItem } from "../../types/common";

const EditContext = createContext<{
  activatedComponents: ComponentItem[];
  setActivatedComponents: React.Dispatch<React.SetStateAction<ComponentItem[]>>;
}>({    
  activatedComponents: [],
  setActivatedComponents: () => {},
});

export default EditContext;
