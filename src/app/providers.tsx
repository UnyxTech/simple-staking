"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { TomoContextProvider } from "@tomo-inc/wallet-connect-sdk";
import { ThemeProvider, useTheme } from "next-themes";
import React from "react";

import { ErrorProvider } from "./context/Error/ErrorContext";
import { TermsProvider } from "./context/Terms/TermsContext";
import { GlobalParamsProvider } from "./context/api/GlobalParamsProvider";
import { StakingStatsProvider } from "./context/api/StakingStatsProvider";
import { BtcHeightProvider } from "./context/mempool/BtcHeightProvider";

function App({ children }: React.PropsWithChildren) {
  const { resolvedTheme } = useTheme();
  return (
    <TomoContextProvider
      evmDefaultChainId={1}
      clientId={
        "bCMfq7lAMPobDhf6kWAHAPtO5Ct6YuA77W9SzhjUixFwOOi0f92vsdJpkAhn0W4tg8TVSeTNUSvBOC3MXYRuIH0Z"
      }
      style={{ theme: resolvedTheme, primaryColor: "#FF7C2A" }}
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
