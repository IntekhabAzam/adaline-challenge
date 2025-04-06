import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Folder } from "./Folder";
import { Item } from "./Item";
import { ElementType } from "../types";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useState } from "react";
import { Button } from "./ui/Button";

type WorkspaceProps = {
  elements: ElementType[];
  onDragEnd: (event: DragEndEvent) => void;
  onToggleFolder: (id: string) => void;
  onAddItem: () => void;
  onAddFolder: () => void;
};

export const Workspace = ({
  elements,
  onDragEnd,
  onToggleFolder,
  onAddItem,
  onAddFolder,
}: WorkspaceProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const rootElements = elements.filter((el) => el.parentId === null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd(event);
  };

  const activeItem = elements.find((el) => el.id === activeId);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4">
        <Button onClick={onAddItem} variant="primary">
          Add Item
        </Button>
        <Button onClick={onAddFolder} variant="secondary">
          Add Folder
        </Button>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <SortableContext
          items={rootElements.map((el) => el.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {rootElements.map((element) =>
              element.type === "item" ? (
                <Item key={element.id} {...element} />
              ) : (
                <Folder
                  key={element.id}
                  {...element}
                  children={elements.filter((el) => el.parentId === element.id)}
                  onToggle={onToggleFolder}
                />
              )
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeItem &&
            (activeItem.type === "item" ? (
              <Item {...activeItem} />
            ) : (
              <Folder {...activeItem} children={[]} onToggle={() => {}} />
            ))}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
