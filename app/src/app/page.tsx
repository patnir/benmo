"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { baseSepolia } from "wagmi/chains"; // add baseSepolia for testing
import App from "./components/App";

export default function Home() {
  return (
    <OnchainKitProvider
      chain={baseSepolia}
      config={{
        appearance: {
          name: "Benmo",
          logo: "https://onchainkit.xyz/favicon/48x48.png?v4-19-24",
          mode: "dark",
          theme: "hacker",
        },
      }}
    >
      <App />
    </OnchainKitProvider>
  );
}
