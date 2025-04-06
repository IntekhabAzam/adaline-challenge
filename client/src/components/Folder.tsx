import {
  FiFolder,
  FiChevronDown,
  FiChevronRight,
  FiMoreVertical,
} from "react-icons/fi";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FolderType, ElementType } from "../types";
import { Item } from "./Item";
import { useMemo } from "react";

type FolderProps = FolderType & {
  children: ElementType[];
  onToggle: (id: string) => void;
};

const DRAG_TRANSITION = {
  duration: 200,
  easing: "ease",
  property: "transform",
} as const;

export const Folder = ({
  id,
  title,
  isOpen,
  children,
  onToggle,
}: FolderProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition: CSS.Transition.toString(DRAG_TRANSITION),
      opacity: isDragging ? 0.6 : 1,
      zIndex: isDragging ? 999 : 1,
      position: "relative" as const,
    }),
    [transform, isDragging]
  );

  const renderChildren = useMemo(() => {
    if (!isOpen || children.length === 0) return null;

    return (
      <div
        className={`
          pl-8 py-2 pr-2 border-t border-gray-100
          ${isDragging ? "opacity-50" : "opacity-100"}
          transition-opacity duration-200
        `}
      >
        {children.map((child) =>
          child.type === "item" ? (
            <Item key={child.id} {...child} />
          ) : (
            <Folder
              key={child.id}
              {...child}
              children={[]}
              onToggle={onToggle}
            />
          )
        )}
      </div>
    );
  }, [isOpen, children, isDragging, onToggle]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        bg-white rounded-lg shadow-sm mb-2
        ${isDragging ? "shadow-lg ring-2 ring-blue-400" : ""}
        transition-all duration-200 ease-in-out
      `}
    >
      <div className="flex items-center gap-2 p-3 relative">
        <DragHandle {...listeners} />
        <FolderHeader
          isOpen={isOpen}
          title={title}
          onToggle={() => onToggle(id)}
        />
      </div>
      {renderChildren}
    </div>
  );
};

const DragHandle = ({ ...listeners }: { [key: string]: unknown }) => (
  <div
    {...listeners}
    className="absolute left-0 top-0 bottom-0 px-2 flex items-center cursor-move hover:bg-gray-50 rounded-l-lg"
  >
    <FiMoreVertical className="text-gray-400" />
  </div>
);

type FolderHeaderProps = {
  isOpen: boolean;
  title: string;
  onToggle: () => void;
};

const FolderHeader = ({ isOpen, title, onToggle }: FolderHeaderProps) => (
  <div
    className="flex items-center flex-1 pl-6 cursor-pointer"
    onClick={onToggle}
  >
    <ToggleButton isOpen={isOpen} />
    <FiFolder className="ml-2 mr-2 text-indigo-600" />
    <span className="font-medium text-gray-700">{title}</span>
  </div>
);

const ToggleButton = ({ isOpen }: { isOpen: boolean }) => (
  <button className="p-1 hover:bg-gray-100 rounded">
    {isOpen ? (
      <FiChevronDown className="text-gray-600" />
    ) : (
      <FiChevronRight className="text-gray-600" />
    )}
  </button>
);
