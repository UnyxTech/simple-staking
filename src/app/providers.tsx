"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import {
  tomoBitcoin,
  tomoBitcoinSignet,
  TomoContextProvider,
} from "@tomo-inc/wallet-connect-sdk";
import { ThemeProvider, useTheme } from "next-themes";
import React from "react";

import IconBlack from "@/app/assets/icon-black.svg";
import IconWhite from "@/app/assets/icon-white.svg";
import { network } from "@/config/network.config";

import { ErrorProvider } from "./context/Error/ErrorContext";
import { TermsProvider } from "./context/Terms/TermsContext";
import { GlobalParamsProvider } from "./context/api/GlobalParamsProvider";
import { StakingStatsProvider } from "./context/api/StakingStatsProvider";
import { BtcHeightProvider } from "./context/mempool/BtcHeightProvider";

type Theme = "dark" | "light";

function App({ children }: React.PropsWithChildren) {
  const { resolvedTheme } = useTheme();

  /** get bitcoinChains for TomoContextProvider */
  const bitcoinChains = [tomoBitcoin, tomoBitcoinSignet].filter(
    (item) => item.network === network,
  );

  return (
    <TomoContextProvider
      bitcoinChains={bitcoinChains}
      cosmosChains={[
        {
          id: 2,
          name: "Cosmos",
          type: "cosmos",
          network: "cosmoshub-4",
        },
      ]}
      chainOption={{
        cosmos: {
          id: "cosmos",
          name: "Babylon",
          logo: IconBlack.src,
          darkLogo: IconWhite.src,
        },
      }}
      // indexWallets={[
      //   'bitcoin_tomo',
      //   'bitcoin_okx',
      //   'bitcoin_unisat',
      //   'bitcoin_onekey',
      //   'bitcoin_bitget',
      //   'bitcoin_imtoken',
      //   'bitcoin_binance',
      // ]}
      // connectionHints={[
      //   {
      //     text: 'Subject to Developer’s compliance with the terms and conditions of this Agreement',
      //     logo: (
      //       <img className={'tm-size-5'} src={'https://tomo.inc/favicon.ico'} />
      //     )
      //   },
      //   {
      //     text: 'I certify that there are no Bitcoin inscriptions tokens in my wallet.'
      //   },
      //   {
      //     isRequired: true,
      //     text: (
      //       <span>
      //         I certify that I have read and accept the updated{' '}
      //         <a className={'tm-text-primary'}>Terms of Use</a> and{' '}
      //         <a className={'tm-text-primary'}>Privacy Policy</a>.
      //       </span>
      //     )
      //   }
      // ]}
      style={{ theme: resolvedTheme as Theme, primaryColor: "#FF7C2A" }}
    >
      {children}
    </TomoContextProvider>
  );
}

function Providers({ children }: React.PropsWithChildren) {
  const [client] = React.useState(new QueryClient());

  return (
    <ThemeProvider defaultTheme="dark" attribute="data-theme">
      <QueryClientProvider client={client}>
        <TermsProvider>
          <ErrorProvider>
            <GlobalParamsProvider>
              <BtcHeightProvider>
                <StakingStatsProvider>
                  <ReactQueryStreamedHydration>
                    <App>{children}</App>
                  </ReactQueryStreamedHydration>
                </StakingStatsProvider>
              </BtcHeightProvider>
            </GlobalParamsProvider>
          </ErrorProvider>
        </TermsProvider>
        <ReactQueryDevtools
          buttonPosition="bottom-left"
          initialIsOpen={false}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default Providers;
