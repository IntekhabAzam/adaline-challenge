import { Workspace } from "./components/Workspace";
import { FolderType, ItemType } from "./types";
import { v4 as uuidv4 } from "uuid";
import { DragEndEvent } from "@dnd-kit/core";
import { EmptyState } from "./components/EmptyState";
import { useWorkspaceConnection } from "./hooks/useWorkspaceConnection";
import { useElementNumbring } from "./hooks/useElementNumbring";

function App() {
  const { isConnected, interactionData, updateData } = useWorkspaceConnection(
    "ws://localhost:8080"
  );
  const { nextItemNumber, nextFolderNumber } = useElementNumbring(
    interactionData.elements
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
        if (overElement.type === "folder") {
          const [movedFolder] = updatedElements.splice(activeIndex, 1);
          updatedElements.splice(overIndex, 0, movedFolder);
          updateData(updatedElements);
          return;
        }
        activeElement.parentId = null;
      } else {
        activeElement.parentId =
          overElement.type === "folder" ? overElement.id : overElement.parentId;
      }

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
