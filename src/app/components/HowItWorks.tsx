import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

export const HowItWorks = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
      >
        <h2 className="text-xl font-semibold">How It Works</h2>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Benmo adds a safety delay to your transactions, giving you time to verify the recipient address before the transfer is completed.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                1
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                When you send ETH, the transaction is queued with a 30-minute delay
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                2
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                You can cancel the transaction during this period if you notice any issues
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                3
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                After the delay period, the transaction is automatically processed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 