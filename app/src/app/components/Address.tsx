import { useAccount } from "wagmi";

const Address = () => {
  const { address } = useAccount();

  // Format address to display first and last few characters with ellipsis in between
  const formatAddress = (address: string | undefined) => {
    if (!address) return "Not connected";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mb-4 flex items-center justify-center">
      <span className="text-sm font-mono">
        {address ? (
          <>
            Your address:{" "}
            <span className="font-semibold">{formatAddress(address)}</span>
          </>
        ) : (
          "Connect your wallet to view your address"
        )}
      </span>
    </div>
  );
};

export default Address;
