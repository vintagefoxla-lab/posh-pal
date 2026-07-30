import { useState, useEffect } from 'react';

/**
 * useABTest Hook
 * @param {string} experiment - Name of the experiment
 * @param {function} userFetch - The authenticated fetch function
 * @returns {string|null} - The assigned variant ('A' or 'B')
 */
export const useABTest = (experiment, userFetch) => {
  const [variant, setVariant] = useState(null);

  useEffect(() => {
    if (!experiment || !userFetch) return;

    userFetch(`/api/ab-test/assign?experiment=${experiment}`)
      .then(res => res.json())
      .then(data => {
        if (data.variant) {
          setVariant(data.variant);
        }
      })
      .catch(err => console.error(`A/B Test assignment failed for ${experiment}:`, err));
  }, [experiment, userFetch]);

  const convert = () => {
    if (!experiment || !userFetch) return;
    userFetch('/api/ab-test/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experiment })
    }).catch(err => console.error(`A/B Test conversion failed for ${experiment}:`, err));
  };

  return { variant, convert };
};
