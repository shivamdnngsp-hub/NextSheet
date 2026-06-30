export type CellStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;

  textColor?: string;
  backgroundColor?: string;

  fontSize?: number;
  fontFamily?: string;

  textAlign?: "left" | "center" | "right";
};