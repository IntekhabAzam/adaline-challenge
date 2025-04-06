export type ItemType = {
    id: string;
    title: string;
    type: 'item';
    icon: string;
    parentId: string | null;
  };
  
  export type FolderType = {
    id: string;
    title: string;
    type: 'folder';
    isOpen: boolean;
    parentId: string | null;
  };
  
  export type ElementType = ItemType | FolderType;
  
  export type WorkspaceData = {
    elements: ElementType[];
  };
  
  export type WebSocketMessage = {
    type: 'initial' | 'update';
    data: WorkspaceData;
  };