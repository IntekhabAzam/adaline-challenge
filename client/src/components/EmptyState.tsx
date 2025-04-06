import { Button } from "./ui/Button";

type EmptyStateProps = {
  onAddItem: () => void;
  onAddFolder: () => void;
};

export const EmptyState = ({ onAddItem, onAddFolder }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="max-w-md text-center p-8 bg-white rounded-lg shadow-sm">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900">No items found</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new task or folder.
      </p>
      <div className="mt-6 flex gap-4 justify-center">
        <Button onClick={onAddItem} variant="primary">
          Add Item
        </Button>
        <Button onClick={onAddFolder} variant="secondary">
          Add Folder
        </Button>
      </div>
    </div>
  </div>
);
