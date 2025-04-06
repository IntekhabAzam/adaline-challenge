import { useMemo } from "react";
import { ItemType, FolderType } from "../types";

export const useElementNumbring = (elements: Array<ItemType | FolderType>) => {
  return useMemo(() => {
    const items = elements.filter((el) => el.type === "item");
    const folders = elements.filter((el) => el.type === "folder");
    return {
      nextItemNumber: items.length + 1,
      nextFolderNumber: folders.length + 1,
    };
  }, [elements]);
};