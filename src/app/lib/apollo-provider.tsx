'use client';

import { PropsWithChildren, useMemo } from 'react';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

function createClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, // set this
      // optional: disable browser-level HTTP cache if you want fresh data
      fetchOptions: { cache: 'no-store' },
      // credentials: 'include', // if you need cookies
    }),
    cache: new InMemoryCache(),
  });
}

export default function ApolloClientProvider({ children }: PropsWithChildren) {
  const client = useMemo(() => createClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}