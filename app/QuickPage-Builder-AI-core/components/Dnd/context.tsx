import { createContext } from "react";

import { ComponentItem } from "../../types/common";


const EditContext = createContext<{
  activatedComponents: ComponentItem[];
  getActivatedComponents: (components: ComponentItem[]) => void;
}>({    
  activatedComponents: [],
  getActivatedComponents: () => {},
});

export default EditContext;
