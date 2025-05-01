"use client";

import { useEffect, useState } from "react";
import { TransactionRow } from "./TransactionRow";
import { SendDialog } from "./SendDialog";
import { useAccount, useBalance, useConfig, useReadContract, useWriteContract } from "wagmi";
import { abi, address } from "./contract";
import { SendButton } from "./SendButton";
import { readContract } from "wagmi/actions";
import { useQuery } from "wagmi/query";

export default function AccountTransactions() {
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

  const { data: hash, writeContractAsync: sendTransaction } =
    useWriteContract();


  const config = useConfig();

  const getTransactions = async () => {
    const receiverEscrows = await readContract(config, {
      address: address,
      abi: abi,
      functionName: 'getReceiverEscrows',
      account: account?.address as `0x${string}`,
    });

    const senderEscrows = await readContract(config, {
      address: address,
      abi: abi,
      functionName: 'getSenderEscrows',
      account: account?.address as `0x${string}`,
    });
    
    return [...receiverEscrows.map((escrow) => ({...escrow, type: "receive"})), ...senderEscrows.map((escrow) => ({...escrow, type: "send"}))];
  }

  const { data: transactions, refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  });

  // Will be used in future implementation
  const handleCancel = async (escrowId: number) => {
    // TODO: Implement actual send functionality
    console.log("Cancelling escrow", escrowId);

    await sendTransaction({
      address: address as `0x${string}`,
      functionName: "cancel",
      args: [BigInt(escrowId)],
      abi,
    });

    console.log("Transaction sent", hash);
    await refetch();
  };

  // Will be used in future implementation
  const handleClaim = async (escrowId: number) => {
    // TODO: Implement actual send functionality
    console.log("Claiming escrow", escrowId);

    await sendTransaction({
      address: address as `0x${string}`,
      functionName: "withdraw",
      args: [BigInt(escrowId)],
      abi,
    });

    console.log("Transaction sent", hash);
    await refetch();
  };

  const handleSend = async (
    amount: string,
    toAddress: string,
    delaySec: number
  ) => {
    // TODO: Implement actual send functionality
    console.log("Sending", amount, "ETH to", toAddress, "with delay", delaySec);

    await sendTransaction({
      address: address as `0x${string}`,
      value: BigInt(Number(amount) * 10 ** 18),
      functionName: "deposit",
      args: [toAddress as `0x${string}`, BigInt(delaySec)],
      abi,
    });

    console.log("Transaction sent", hash);
    await refetch();
  };

  // Calculate end times for pending transactions (30 minutes from now)
  const now = new Date();
  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

  const account = useAccount();

  const { data, error, isLoading, isLoadingError } = useBalance({
    address: account?.address,
    // address:  as `0x${string}`,
  });


  type Transaction = {
    id: bigint;
    sender: `0x${string}`;
    receiver: `0x${string}`;
    amount: bigint;
    status: number;
    canWithdrawAt: bigint;
    type: "receive" | "send";
}


  return (
    <div className="text-gray-100">
      <div className="mb-6">
        <SendButton onClick={() => setIsSendDialogOpen(true)} />
      </div>

      <div>
        {(transactions as Transaction[])?.map((transaction) => (
          <TransactionRow
            id={transaction.id}
            key={transaction.id}
            type={transaction.type}
            onWithdraw={() => handleClaim(Number(transaction.id))}
            onCancel={() => handleCancel(Number(transaction.id))}
            // onConfirm={() => handle(Number(transaction.id))}
            status="pending"
            amount={`${(Number(transaction.amount) / 1e18).toFixed(6)} ETH`}
            date={"May 1, 2025"}
            endTime={new Date(Number(transaction.canWithdrawAt) * 1000)}
            />
        ))}
        <SendDialog
          isOpen={isSendDialogOpen}
          onClose={() => setIsSendDialogOpen(false)}
          onSend={handleSend}
          maxAmount={data?.formatted.toString()}
        />
      </div>
    </div>
  );
}
