import { ReactNode } from 'react';
import { ArrowUpIcon, ArrowDownIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Timer } from './Timer';

type TransactionType = 'send' | 'receive';
type TransactionStatus = 'pending' | 'completed';

interface TransactionRowProps {
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  date: string;
  endTime?: Date;
  onAction?: () => void;
  onTimerComplete?: () => void;
}

export function TransactionRow({
  type,
  status,
  amount,
  date,
  endTime,
  onAction,
  onTimerComplete,
}: TransactionRowProps) {
  // Determine the icon and color based on transaction type
  const Icon = type === 'send' ? ArrowUpIcon : ArrowDownIcon;
  const iconColor = type === 'send' 
    ? 'text-blue-600 dark:text-blue-400'
    : 'text-green-600 dark:text-green-400';

  return (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`${iconColor} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {type === 'send' ? 'Sending' : 'Receiving'} {amount}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{date}</span>
              {endTime && status === 'pending' && (
                <>
                  <span>•</span>
                  <span>
                    <Timer endTime={endTime} onComplete={onTimerComplete} /> remaining
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {status === 'pending' && type === 'send' && (
          <div className="flex gap-2">
            <button
              onClick={onAction}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={onAction}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Finalize
            </button>
          </div>
        )}
        
        {status === 'completed' && (
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            <CheckCircleIcon className="w-5 h-5" />
            Completed
          </div>
        )}
      </div>
    </div>
  );
} 