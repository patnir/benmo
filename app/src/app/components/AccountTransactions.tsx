'use client';

import { useState } from 'react';
import { TransactionRow } from './TransactionRow';
import { SendDialog } from './SendDialog';
import { ArrowUpIcon } from '@heroicons/react/24/solid';
import { useBalance, useReadContract, useSendTransaction, useWalletClient, useWriteContract } from 'wagmi';
import { Wallet } from '@coinbase/onchainkit/wallet';
import { abi, address } from './contract';

export default function AccountTransactions() {
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

  const { data: hash, writeContractAsync: sendTransaction } = useWriteContract()


  const handleCancel = async (escrowId: number) => {
    // TODO: Implement actual send functionality
    console.log('Cancelling escrow', escrowId);

    await sendTransaction({
      address: address as `0x${string}`,
      functionName: 'cancel',
      args: [BigInt(escrowId)],
      abi,
    });

    console.log('Transaction sent', hash);
  };


  const handleClaim = async (escrowId: number) => {
    // TODO: Implement actual send functionality
    console.log('Claiming escrow', escrowId);

    await sendTransaction({
      address: address as `0x${string}`,
      functionName: 'withdraw',
      args: [BigInt(escrowId)],
      abi,
    });

    console.log('Transaction sent', hash);
  };

  const handleSend = async (amount: string, address: string, delaySec: number) => {
    // TODO: Implement actual send functionality
    console.log('Sending', amount, 'ETH to', address, 'with delay', delaySec);

    await sendTransaction({
      address: address as `0x${string}`,
      value: BigInt(amount),
      functionName: 'deposit',
      args: [address as `0x${string}`, BigInt(delaySec)],
      abi,
    });

    console.log('Transaction sent', hash);
  };

  // Calculate end times for pending transactions (30 minutes from now)
  const now = new Date();
  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

  const accountBalance = useBalance();
  // const latestTransactions = useReadContract({
  //   address: address,
  //   abi: abi,
  //   functionName: 'senderEscrows',
  //   args: [account?.address],
  // });

  return (

    <div>
      <div className="mb-6 flex justify-between">
        <button
          onClick={() => setIsSendDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600! text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowUpIcon className="w-5 h-5" />
          Send ETH
        </button>
        <Wallet />
      </div>

      <div>
        {/* Pending receive transaction */}
        <TransactionRow
          type="receive"
          status="pending"
          amount="0.5 ETH"
          endTime={thirtyMinutesFromNow}
          date="2024-03-20 14:30"
        />

        {/* Completed receive transaction */}
        <TransactionRow
          type="receive"
          status="completed"
          amount="1.2 ETH"
          date="2024-03-19 09:15"
        />

        {/* Pending send transaction */}
        <TransactionRow
          type="send"
          status="pending"
          amount="0.3 ETH"
          endTime={thirtyMinutesFromNow}
          onAction={() => console.log('Cancel transaction')}
          date="2024-03-20 15:45"
        />

        {/* Completed send transaction */}
        <TransactionRow
          type="send"
          status="completed"
          amount="0.8 ETH"
          date="2024-03-18 16:20"
        />
      <SendDialog
        isOpen={isSendDialogOpen}
        onClose={() => setIsSendDialogOpen(false)}
        onSend={handleSend}
        maxAmount={accountBalance.data?.value.toString()}
      />
      </div>
</div>
  );
}