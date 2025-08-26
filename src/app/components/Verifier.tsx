'use client';

import dynamic from 'next/dynamic';
import { useLazyQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import VerifierFormUI from './VerifierForm';
import { gql } from '@apollo/client';
import { useLocalStorage } from '../lib/presistence';

const Map = dynamic(() => import('./map/Map'), { ssr: false });

const VERIFY = gql`
  query Verify($suburb: String!, $postcode: String!, $state: String!) {
    verifyAddress(suburb: $suburb, postcode: $postcode, state: $state) {
      isValid
      errors
      bestMatch {
        latitude
        longitude
        location
        postcode
        state
        category
      }
    }
  }
`;

type VerifyVars = {
  suburb: string;
  postcode: string;
  state: string;
};

type VerifyResult = {
  isValid: boolean;
  errors: string[];
  bestMatch?: {
    latitude?: number | null;
    longitude?: number | null;
    location?: string | null;
    postcode?: string | null;
    state?: string | null;
    category?: string | null;
  } | null;
};

type VerifyData = { verifyAddress: VerifyResult };

export default function Verifier() {
  const [result, setResult] = useLocalStorage<VerifyResult | null>('verifier-result', null);
  const [formData, setFormData] = useLocalStorage<VerifyVars | null>('verifier-form', null);
  const [isHydrated, setIsHydrated] = useState(false);

  const [runVerify, { loading, error, data }] = useLazyQuery<VerifyData, VerifyVars>(VERIFY, {
    fetchPolicy: 'no-cache',
  });

  // Wait for hydration to complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle data changes
  useEffect(() => {
    if (data) {
      console.log('~data received:', data);
      const payload = data?.verifyAddress ?? null;
      console.log('~payload:', payload);
      setResult(payload);
      
      // Log to Elasticsearch
      if (lastSubmittedVarsRef) {
        try {
          fetch('/api/logs', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ 
              kind: 'verifier', 
              input: lastSubmittedVarsRef, 
              output: payload, 
              at: new Date().toISOString() 
            }),
          });
        } catch {}
      }
    }
  }, [data]);

  let lastSubmittedVarsRef: VerifyVars | null = null;

  const handleVerify = (vars: VerifyVars) => {
    lastSubmittedVarsRef = vars;
    setFormData(vars);
    runVerify({ variables: vars });
  };

  const best = result?.bestMatch;
  const hasCoords = !!best && Number.isFinite(best.latitude) && Number.isFinite(best.longitude);

  useEffect(() => {
    console.log('~result state changed:', result);
  }, [result]);

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-sm opacity-70">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <VerifierFormUI 
        loading={loading} 
        onVerify={handleVerify}
        initialData={formData}
      />

      {error && <p className="text-red-700">Something went wrong while verifying. Please try again.</p>}

      {result && (
        <div className="space-y-2">
          {result.isValid ? (
            <p className="text-green-700">The postcode, suburb, and state input are valid.</p>
          ) : (
            <ul className="text-red-600 list-disc pl-5">
              {result.errors?.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}

          {hasCoords && (
              <Map lat={best!.latitude as number} lng={best!.longitude as number} />
          )}
        </div>
      )}
    </div>
  );
}


