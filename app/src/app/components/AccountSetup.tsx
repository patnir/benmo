import { Wallet } from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";

const AccountSetup = () => {
  return (
    <div>
      <Wallet />
    </div>
  );
};

export default AccountSetup;
