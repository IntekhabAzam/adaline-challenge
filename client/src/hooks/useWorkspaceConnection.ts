import { useState, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
import { FolderType, ItemType, WorkspaceData } from "../types";

export const useWorkspaceConnection = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [interactionData, setInteractionData] = useState<WorkspaceData>({
    elements: [],
  });

  const { sendMessage } = useWebSocket(url, {
    onMessage: (message) => {
      const { type, data } = JSON.parse(message.data);
      if (type === "initial" || type === "update") {
        setInteractionData(data);
      }
    },
    onOpen: () => setIsConnected(true),
    onClose: () => setIsConnected(false),
  });

  const updateData = useCallback(
    (elements: (ItemType | FolderType)[]) => {
      const updatedData = { elements };
      setInteractionData(updatedData);
      sendMessage({ type: "update", data: updatedData });
    },
    [sendMessage]
  );

  return {
    isConnected,
    interactionData,
    updateData,
  };
};