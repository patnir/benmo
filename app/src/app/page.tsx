'use client';


import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains'; // add baseSepolia for testing 
import App from './components/App';

export default function Home() {

  return (
      <OnchainKitProvider chain={baseSepolia}>
       <App />
      </OnchainKitProvider>
  )
}
