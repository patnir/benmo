import { useAccount } from "wagmi";
import { HowItWorks } from "./HowItWorks";
import AccountSetup from "./AccountSetup";
import AccountTransactions from "./AccountTransactions";

const App = () => {
  const account = useAccount();

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Benmo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Send transactions without worrying about sending to the wrong address.
        </p>
      </div>
      <HowItWorks />

      {!account.isConnected ? <AccountSetup /> : <AccountTransactions />}
    </main>
  );
};

export default App;
