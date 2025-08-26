'use client';

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: '/api/graphql' }),
    cache: new InMemoryCache(),

  })}