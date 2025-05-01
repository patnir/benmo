import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FormField } from './FormField';

interface SendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (amount: string, address: string, delaySec: number) => Promise<void>;
  maxAmount?: string; // Optional max amount in ETH
}

// Ethereum address validation
const isValidEthAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Format ETH amount to 18 decimals
const formatEthAmount = (amount: string): string => {
  if (!amount) return '';
  const num = parseFloat(amount);
  if (isNaN(num)) return '';
  return num.toFixed(18);
};

export function SendDialog({ isOpen, onClose, onSend, maxAmount = '0' }: SendDialogProps) {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [minutes, setMinutes] = useState('30'); // Default to 30 minutes
  const [errors, setErrors] = useState<{ amount?: string; address?: string; minutes?: string; send?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setAddress('');
      setMinutes('30');
      setErrors({});
      setIsLoading(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; address?: string; minutes?: string } = {};

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    } else if (numAmount > parseFloat(maxAmount)) {
      newErrors.amount = `Amount exceeds maximum balance of ${maxAmount} ETH`;
    }

    // Validate address
    if (!address) {
      newErrors.address = 'Please enter a recipient address';
    } else if (!isValidEthAddress(address)) {
      newErrors.address = 'Please enter a valid Ethereum address';
    }

    // Validate minutes
    const numMinutes = parseInt(minutes);
    if (isNaN(numMinutes) || numMinutes <= 0) {
      newErrors.minutes = 'Please enter a valid delay time greater than 0';
    } else if (numMinutes > 1440) { // 24 hours in minutes
      newErrors.minutes = 'Delay time cannot exceed 24 hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({ ...errors, send: undefined });

    try {
      const delaySec = parseInt(minutes) * 60; // Convert minutes to seconds
      await onSend(amount, address, delaySec);
      onClose();
    } catch (error) {
      setErrors({
        ...errors,
        send: error instanceof Error ? error.message : 'Failed to send transaction',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      if (errors.amount) {
        setErrors({ ...errors, amount: undefined });
      }
    }
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    if (errors.address) {
      setErrors({ ...errors, address: undefined });
    }
  };

  const handleMinutesChange = (value: string) => {
    if (value === '' || /^\d*$/.test(value)) {
      setMinutes(value);
      if (errors.minutes) {
        setErrors({ ...errors, minutes: undefined });
      }
    }
  };

  const handleMaxAmount = () => {
    setAmount(maxAmount);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Send ETH
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Available: {maxAmount} ETH
                      </span>
                      <button
                        type="button"
                        onClick={handleMaxAmount}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        disabled={isLoading}
                      >
                        Use Max
                      </button>
                    </div>
                    <FormField
                      label="Amount"
                      id="amount"
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.0"
                      error={errors.amount}
                      required
                      inputMode="decimal"
                      suffix={<span className="text-gray-500 dark:text-gray-400">ETH</span>}
                      disabled={isLoading}
                    />
                  </div>

                  <FormField
                    label="Recipient Address"
                    id="address"
                    value={address}
                    onChange={handleAddressChange}
                    placeholder="0x..."
                    error={errors.address}
                    required
                    disabled={isLoading}
                  />

                  <FormField
                    label="Delay Time"
                    id="minutes"
                    type="text"
                    value={minutes}
                    onChange={handleMinutesChange}
                    placeholder="30"
                    error={errors.minutes}
                    required
                    inputMode="numeric"
                    suffix={<span className="text-gray-500 dark:text-gray-400">minutes</span>}
                    helpText="Time before the transaction becomes irreversible"
                    disabled={isLoading}
                  />

                  {errors.send && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/50 p-4">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.send}
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600! hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={!amount || !address || !minutes || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Send ETH'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 