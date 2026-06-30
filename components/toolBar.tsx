"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  PaintBucket,
  Type,
  Underline,
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";

import { useSelector } from "react-redux";
import { useParams } from "next/navigation";

import getYSheet from "@/yjs/ydoc";
import { styleUpdate } from "@/lib/styles/updateStyles";
import type { CellStyle } from "@/types/cellStyle";

type ToolBarProps = {
  styles: Record<string, CellStyle>;
};

const fontSizes = [10, 12, 14, 16];

const ToolBar = ({ styles }: ToolBarProps) => {
  const params = useParams();
  const sheetId = params.sheetId as string;

  const activeCell = useSelector(
    (state: any) => state.selection.activeCell
  );

  const { ystyles } = getYSheet(sheetId);

  const currentStyle =
    activeCell && styles[activeCell]
      ? styles[activeCell]
      : {};

  return (
    <div
      className={`flex w-full items-center gap-2 overflow-x-auto border-b bg-background px-3 py-2 whitespace-nowrap transition-opacity ${
        !activeCell ? "opacity-50" : "opacity-100"
      }`}
    >
      {/* Bold */}
      <Button
        disabled={!activeCell}
        size="icon"
        className="h-8 w-8"
        variant={currentStyle.bold ? "default" : "outline"}
        onClick={() =>
          styleUpdate(ystyles, activeCell!, {
            bold: !currentStyle.bold,
          })
        }
      >
        <Bold className="h-4 w-4" />
      </Button>

      {/* Italic */}
      <Button
        disabled={!activeCell}
        size="icon"
        className="h-8 w-8"
        variant={currentStyle.italic ? "default" : "outline"}
        onClick={() =>
          styleUpdate(ystyles, activeCell!, {
            italic: !currentStyle.italic,
          })
        }
      >
        <Italic className="h-4 w-4" />
      </Button>

      {/* Underline */}
      <Button
        disabled={!activeCell}
        size="icon"
        className="h-8 w-8"
        variant={currentStyle.underline ? "default" : "outline"}
        onClick={() =>
          styleUpdate(ystyles, activeCell!, {
            underline: !currentStyle.underline,
          })
        }
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Font Size */}
      <Select
        disabled={!activeCell}
        value={String(currentStyle.fontSize ?? 14)}
        onValueChange={(value) =>
          styleUpdate(ystyles, activeCell!, {
            fontSize: Number(value),
          })
        }
      >
        <SelectTrigger className="h-8 w-16">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {fontSizes.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Color */}
      <div className="flex items-center gap-1 rounded-md border px-2 py-1">
        <Type className="h-4 w-4" />

        <Input
          disabled={!activeCell}
          type="color"
          className="h-6 w-8 cursor-pointer border-0 p-0"
          value={currentStyle.textColor ?? "#000000"}
          onChange={(e) =>
            styleUpdate(ystyles, activeCell!, {
              textColor: e.target.value,
            })
          }
        />
      </div>

      {/* Background Color */}
      <div className="flex items-center gap-1 rounded-md border px-2 py-1">
        <PaintBucket className="h-4 w-4" />

        <Input
          disabled={!activeCell}
          type="color"
          className="h-6 w-8 cursor-pointer border-0 p-0"
          value={currentStyle.backgroundColor ?? "#ffffff"}
          onChange={(e) =>
            styleUpdate(ystyles, activeCell!, {
              backgroundColor: e.target.value,
            })
          }
        />
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Align Left */}
      <Button
        disabled={!activeCell}
        size="icon"
        className="h-8 w-8"
        variant={currentStyle.textAlign === "left" ? "default" : "outline"}
        onClick={() =>
          styleUpdate(ystyles, activeCell!, {
            textAlign: "left",
          })
        }
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      {/* Align Center */}
      <Button
        disabled={!activeCell}
        size="icon"
        className="h-8 w-8"
        variant={currentStyle.textAlign === "center" ? "default" : "outline"}
        onClick={() =>
          styleUpdate(ystyles, activeCell!, {
            textAlign: "center",
          })
        }
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      {/* Align Right */}
      <Button
        disabled={!activeCell}
        size="icon"
        className="h-8 w-8"
        variant={currentStyle.textAlign === "right" ? "default" : "outline"}
        onClick={() =>
          styleUpdate(ystyles, activeCell!, {
            textAlign: "right",
          })
        }
      >
        <AlignRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ToolBar;