import {
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Timer } from "./Timer";

type TransactionType = "send" | "receive";
type TransactionStatus = "pending" | "completed";

interface TransactionRowProps {
  id: bigint;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  date: string;
  endTime?: Date;
  onCancel?: () => void;
  onConfirm?: () => void;
  onWithdraw?: () => void;
}

export function TransactionRow({
  id,
  type,
  status,
  amount,
  date,
  endTime,
  onCancel,
  onConfirm,
  onWithdraw,
}: TransactionRowProps) {
  // Determine the icon and color based on transaction type
  const Icon = type === "send" ? ArrowUpIcon : ArrowDownIcon;
  const iconColor = type === "send" ? "text-blue-400" : "text-green-400";

  if (endTime && endTime.getTime() < Date.now()) {
    endTime = undefined;
    if (type === "send") {
      status = "completed";
    }
  }

  return (
    <div className="py-4 px-4 border-b border-gray-700 last:border-b-0 bg-gray-700 rounded-lg mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`${iconColor} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-100">
              {type === "send" ? "Sending" : "Receiving"} {amount}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>{date}</span>
              {endTime && status === "pending" && (
                <>
                  <span>•</span>
                  <span>
                    <Timer endTime={endTime} /> remaining
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {status === "pending" && (
          <div className="flex gap-2">
            {type === "send" && (
              <>
                <button
                  onClick={() => {
                    // TODO: Implement cancel functionality
                    if (onCancel) onCancel();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement confirm functionality
                    if (onConfirm) onConfirm();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <CheckIcon className="w-4 h-4" />
                  Confirm
                </button>
              </>
            )}
            {type === "receive" && (
              <button
                onClick={() => {
                  // TODO: Implement claim functionality
                  if (onWithdraw) onWithdraw();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <CheckIcon className="w-4 h-4" />
                Claim
              </button>
            )}
          </div>
        )}

        {status === "completed" && (
          <div className="flex items-center gap-2 text-sm font-medium text-blue-400">
            <CheckCircleIcon className="w-5 h-5" />
            Completed
          </div>
        )}
      </div>
    </div>
  );
}
