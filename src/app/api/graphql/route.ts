import { NextRequest } from 'next/server';

export const runtime = 'edge';

const AUS_POST_BASE = process.env.AUS_POST_BASE_URL || 'https://gavg8gilmf.execute-api.ap-southeast-2.amazonaws.com/staging/postcode/search.json';
const AUS_POST_TOKEN = process.env.AUS_POST_TOKEN || '7710a8c5-ccd1-160f-70cf03e8-b2bbaf01';

function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { query, variables } = body || {};

    console.log('GraphQL request:', { query, variables });

    const q: string = String(query || '');
    
    if (q.includes('verifyAddress')) {
      const { suburb, postcode, state } = variables || {};
      
      // Search by postcode to get all localities
      const postcodeUrl = new URL(AUS_POST_BASE);
      postcodeUrl.searchParams.set('q', postcode);
      
      console.log('Calling Australia Post API:', String(postcodeUrl));
      
      const postcodeResp = await fetch(String(postcodeUrl), {
        headers: { Authorization: `Bearer ${AUS_POST_TOKEN}` },
      });
      
      if (!postcodeResp.ok) {
        console.error('Australia Post API error:', postcodeResp.status, postcodeResp.statusText);
        return json({ errors: [{ message: 'Failed to verify address' }] }, { status: 502 });
      }
      
      const postcodeData = await postcodeResp.json();
      console.log('Australia Post response:', postcodeData);
      const localities: any[] = postcodeData?.localities?.locality || [];

      const normalizedSuburb = String(suburb || '').trim().toUpperCase();
      const normalizedState = String(state || '').trim().toUpperCase();
      const normalizedPostcode = String(postcode || '').trim();

      const errors: string[] = [];

      // If no localities found for the postcode, it's invalid
      if (localities.length === 0) {
        errors.push(`The postcode ${normalizedPostcode} does not exist`);
        return json({ 
          data: { 
            verifyAddress: { 
              isValid: false, 
              errors, 
              bestMatch: null 
            } 
          } 
        });
      }

      // Find suburb matches (any state)
      const suburbMatches = localities.filter((l) => 
        String(l.location).toUpperCase() === normalizedSuburb
      );

      // Find postcode matches
      const postcodeMatches = localities.filter((l) => 
        String(l.postcode) === normalizedPostcode
      );

      // Validate postcode vs suburb
      if (normalizedPostcode && normalizedSuburb) {
        const ok = suburbMatches.some((l) => String(l.postcode) === normalizedPostcode);
        if (!ok) {
          if (suburbMatches.length > 0) {
            // Suburb exists but with different postcode
            const actualPostcode = suburbMatches[0].postcode;
            errors.push(`The postcode ${normalizedPostcode} does not match the suburb ${suburb}`);
          } else {
            // Suburb doesn't exist at all
            errors.push(`The suburb ${suburb} does not exist`);
          }
        }
      }

      // Validate suburb vs state
      if (normalizedSuburb && normalizedState) {
        const ok = suburbMatches.some((l) => String(l.state).toUpperCase() === normalizedState);
        if (!ok) {
          if (suburbMatches.length > 0) {
            // Suburb exists but in different state
            const actualState = suburbMatches[0].state;
            errors.push(`The suburb ${suburb} does not exist in the state ${state}`);
          } else {
            // Suburb doesn't exist at all
            errors.push(`The suburb ${suburb} does not exist`);
          }
        }
      }

      // Remove duplicate errors
      const uniqueErrors = [...new Set(errors)];

      const isValid = uniqueErrors.length === 0 && normalizedSuburb && normalizedPostcode && normalizedState;

      // Pick best match: exact suburb + postcode + state if available, else the first matching by postcode
      const bestMatch =
        suburbMatches.find(
          (l) => String(l.postcode) === normalizedPostcode && String(l.state).toUpperCase() === normalizedState,
        ) || postcodeMatches[0] || localities[0] || null;

      return json({ 
        data: { 
          verifyAddress: { 
            isValid: Boolean(isValid), 
            errors: uniqueErrors, 
            bestMatch 
          } 
        } 
      });
    }

    if (q.includes('searchLocations')) {
      const { q: search, state } = variables || {};
      const url = new URL(AUS_POST_BASE);
      if (search) url.searchParams.set('q', String(search));
      if (state) url.searchParams.set('state', String(state));
      const resp = await fetch(String(url), {
        headers: { Authorization: `Bearer ${AUS_POST_TOKEN}` },
      });
      if (!resp.ok) {
        return json({ errors: [{ message: 'Upstream error' }] }, { status: 502 });
      }
      const data = await resp.json();
      const list: any[] = data?.localities?.locality || [];
      return json({ data: { searchLocations: list } });
    }

    return json({ errors: [{ message: 'Unknown query' }] }, { status: 400 });
    
  } catch (error) {
    console.error('GraphQL route error:', error);
    return json({ errors: [{ message: 'Internal server error' }] }, { status: 500 });
  }
}


