import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";

type SheetDoc = {
  ydoc: Y.Doc;
  ycells: Y.Map<string>;
  awareness: Awareness;
};

const docs = new Map<string, SheetDoc>();

const getYSheet = (sheetId: string): SheetDoc => {
  if (!docs.has(sheetId)) {
    const ydoc = new Y.Doc();

    docs.set(sheetId, {
      ydoc,
      ycells: ydoc.getMap<string>("cells"),
      awareness: new Awareness(ydoc),
    });
  }

  return docs.get(sheetId)!;
};

export default getYSheet;