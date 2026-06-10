import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";

export const ydoc = new Y.Doc();

export const ycells = ydoc.getMap<string>("cells");
export const awareness =new Awareness(ydoc);