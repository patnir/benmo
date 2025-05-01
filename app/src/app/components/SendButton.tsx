import { ArrowUpIcon } from "@heroicons/react/24/solid";

interface SendButtonProps {
  onClick: () => void;
}

export const SendButton = ({ onClick }: SendButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center w-full justify-center gap-2 px-4 py-2 bg-blue-600! text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <ArrowUpIcon className="w-5 h-5" />
      Send ETH
    </button>
  );
};
