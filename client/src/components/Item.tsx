import { FiFile } from "react-icons/fi";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ItemType } from "../types";

export const Item = ({ id, title, icon }: ItemType) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        flex items-center p-2 bg-white rounded-lg shadow-sm mb-2 cursor-move hover:bg-gray-50
        border border-gray-200
        ${isDragging ? "ring-2 ring-blue-400" : ""}
        transition-all duration-200 ease-in-out
      `}
    >
      {icon === "file" && <FiFile className="mr-2" />}
      <span>{title}</span>
    </div>
  );
};
