import { useState, useMemo, useCallback } from "react";
import { Workspace } from "./components/Workspace";
import { useWebSocket } from "./hooks/useWebSocket";
import { FolderType, ItemType, WorkspaceData } from "./types";
import { v4 as uuidv4 } from "uuid";
import { DragEndEvent } from "@dnd-kit/core";
import { EmptyState } from "./components/EmptyState";

function App() {
  const [interactionData, setInteractionData] = useState<WorkspaceData>({
    elements: [],
  });
  const [isConnected, setIsConnected] = useState(false);
  const { sendMessage } = useWebSocket("ws://localhost:8080", {
    onMessage: (message) => {
      const { type, data } = JSON.parse(message.data);
      if (type === "initial" || type === "update") {
        setInteractionData(data);
      }
    },
    onOpen: () => setIsConnected(true),
    onClose: () => setIsConnected(false),
  });

  // Update server when local data changes
  const updateData = useCallback(
    (elements: (ItemType | FolderType)[]) => {
      const updatedData = { elements };
      setInteractionData(updatedData);
      sendMessage({ type: "update", data: updatedData });
    },
    [sendMessage]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active) return;

    const updatedElements = [...interactionData.elements];
    const activeElement = updatedElements.find((el) => el.id === active.id);
    if (!activeElement) return;

    // Case 1: Moving to root level
    if (!over || over.id === active.id) {
      activeElement.parentId = null;
      updatedElements.push(
        ...updatedElements.splice(
          updatedElements.findIndex((el) => el.id === active.id),
          1
        )
      );
    }
    // Case 2: Moving between elements
    else if (active.id !== over.id) {
      const overElement = updatedElements.find((el) => el.id === over.id);
      if (!overElement) return;

      const activeIndex = updatedElements.findIndex(
        (el) => el.id === active.id
      );
      const overIndex = updatedElements.findIndex((el) => el.id === over.id);

      // Prevent all folder nesting scenarios
      if (activeElement.type === "folder") {
        // If dragging a folder onto another folder, just reorder them
        if (overElement.type === "folder") {
          const [movedFolder] = updatedElements.splice(activeIndex, 1);
          updatedElements.splice(overIndex, 0, movedFolder);
          updateData(updatedElements);
          return;
        }
        // If dragging a folder onto an item, keep folder at root level
        activeElement.parentId = null;
      } else {
        // Items can be placed in folders or reordered
        activeElement.parentId =
          overElement.type === "folder" ? overElement.id : overElement.parentId;
      }

      // Reorder elements
      updatedElements.splice(activeIndex, 1);
      updatedElements.splice(overIndex, 0, activeElement);
    }

    updateData(updatedElements);
  };

  const handleToggleFolder = (folderId: string) => {
    updateData(
      interactionData.elements.map((el) =>
        el.type === "folder" && el.id === folderId
          ? { ...el, isOpen: !el.isOpen }
          : el
      )
    );
  };

  const { nextItemNumber, nextFolderNumber } = useMemo(() => {
    const items = interactionData.elements.filter((el) => el.type === "item");
    const folders = interactionData.elements.filter(
      (el) => el.type === "folder"
    );
    return {
      nextItemNumber: items.length + 1,
      nextFolderNumber: folders.length + 1,
    };
  }, [interactionData.elements]);

  const handleAddItem = () => {
    const newItem: ItemType = {
      id: uuidv4(),
      title: `New Item ${nextItemNumber}`,
      type: "item",
      icon: "file",
      parentId: null,
    };
    updateData([...interactionData.elements, newItem]);
  };

  const handleAddFolder = () => {
    const newFolder: FolderType = {
      id: uuidv4(),
      title: `New Folder ${nextFolderNumber}`,
      type: "folder",
      isOpen: true,
      parentId: null,
    };
    updateData([...interactionData.elements, newFolder]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {!isConnected ? (
        <div className="flex items-center justify-center h-full">
          <p>Connecting to server...</p>
        </div>
      ) : interactionData.elements.length === 0 ? (
        <EmptyState onAddItem={handleAddItem} onAddFolder={handleAddFolder} />
      ) : (
        <Workspace
          elements={interactionData.elements}
          onDragEnd={handleDragEnd}
          onToggleFolder={handleToggleFolder}
          onAddItem={handleAddItem}
          onAddFolder={handleAddFolder}
        />
      )}
    </div>
  );
}

export default App;
