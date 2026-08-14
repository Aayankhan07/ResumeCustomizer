import { useState, useCallback } from 'react';
import { transformResume } from '../lib/api';
import { toast } from 'sonner';

const RETRY_ERRORS = ['AI_TIMEOUT', 'INTERNAL_SERVER_ERROR'];

export function useTransform() {
  const [state, setState] = useState({
    status: 'idle',      // idle | loading | success | error
    persisted: true,     // false when the result was generated but not saved
    result: null,
    plainText: null,
    transformationId: null,
    error: null,
    errorDetails: null,
    rateLimit: null,
  });

  const transform = useCallback(async ({ resumeText, jobDescriptionText, optimizationMode }) => {
    setState(s => ({ ...s, status: 'loading', error: null }));

    const attemptTransform = async (attempt = 1) => {
      try {
        const data = await transformResume({ resumeText, jobDescriptionText, optimizationMode });

        // The transform itself succeeded, but persisted === false means the
        // result never reached history. Surface that rather than reporting
        // plain success for a result the user cannot find again later.
        const persisted = data.persisted !== false;

        setState({
          status: 'success',
          persisted,
          result: data.data,
          plainText: data.plain_text,
          transformationId: data.transformation_id,
          error: persisted ? null : 'DATABASE_SAVE_FAILED',
          rateLimit: data.rate_limit,
        });

        if (!persisted) {
          toast.warning('Your resume was generated but could not be saved to history. Download it before leaving this page.');
        }
      } catch (err) {
        if (attempt === 1 && RETRY_ERRORS.includes(err.code)) {
          // Auto-retry once after 2 seconds
          await new Promise(r => setTimeout(r, 2000));
          return attemptTransform(2);
        }
        setState(s => ({
          ...s,
          status: 'error',
          error: err.code ?? 'UNKNOWN_ERROR',
          errorDetails: err.details ?? null,
          rateLimit: (err.code === 'RATE_LIMIT_EXCEEDED' || err.code === 'RATE_LIMITED') ? { resetAt: err.resetAt } : s.rateLimit,
        }));
        if (err.code !== 'RATE_LIMIT_EXCEEDED' && err.code !== 'RATE_LIMITED' && err.code !== 'DATABASE_SAVE_FAILED') {
          toast.error('Transform failed. Please try again.');
        }
      }
    };

    await attemptTransform();
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle', persisted: true, result: null, plainText: null,
      transformationId: null, error: null, rateLimit: null,
    });
  }, []);

  return { ...state, transform, reset };
}
