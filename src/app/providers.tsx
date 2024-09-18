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
    (item) => item.networkName === network,
  );

  return (
    <TomoContextProvider
      bitcoinChains={bitcoinChains}
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
