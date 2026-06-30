import * as Y from "yjs";
import type { CellStyle } from "@/types/cellStyle";


export const styleUpdate = (ystyles: Y.Map<CellStyle>,cellId: string,styleUpdates: Partial<CellStyle>) => {
  const currentStyle = ystyles.get(cellId) || {};
  ystyles.set(cellId, {...currentStyle,...styleUpdates,});
};