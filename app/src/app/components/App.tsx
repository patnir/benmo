import { useAccount } from "wagmi";
import AccountSetup from "./AccountSetup";
import AccountTransactions from "./AccountTransactions";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { baseSepolia } from "wagmi/chains";

const App = () => {
  const account = useAccount();

  return (
    <div className="min-h-screen w-full bg-gray-800">
      <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto text-gray-100">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold mb-2 text-white">Benmo</h1>
            <Wallet />
          </div>
          <p className="text-gray-300">
            Send transactions without worrying about sending to the wrong
            address.
          </p>
        </div>
        {/* <HowItWorks /> */}

        {!account.isConnected ? <AccountSetup /> : <AccountTransactions />}
      </main>
    </div>
  );
};

export default App;
