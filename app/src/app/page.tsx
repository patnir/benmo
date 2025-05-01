'use client';

import { useState } from 'react';
import { TransactionRow } from './components/TransactionRow';
import { SendDialog } from './components/SendDialog';
import { HowItWorks } from './components/HowItWorks';
import { ArrowUpIcon } from '@heroicons/react/24/solid';
import AccountSetup from './components/AccountSetup';
import AccountTransactions from './components/AccountTransactions';

export default function Home() {
  const isAccountSetup = false;

  return (

    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Benmo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Send transactions without worrying about sending to the wrong address.
        </p>
      </div>

      <HowItWorks />

      {!isAccountSetup ? <AccountSetup /> : <AccountTransactions />}
    </main>
  )
}
