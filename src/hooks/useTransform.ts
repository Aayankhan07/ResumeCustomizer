'use client';

import { useState, useCallback } from 'react';
import { transformResume, ApiError } from '../lib/api';
import type { TransformOutput } from '../lib/schemas';
import { toast } from 'sonner';

/** Errors worth one automatic retry: transient rather than caused by input. */
const RETRY_ERRORS = ['AI_TIMEOUT', 'INTERNAL_SERVER_ERROR', 'NETWORK_ERROR'];


type Status = 'idle' | 'loading' | 'success' | 'error';

interface TransformState {
  status: Status;
  /** true while the automatic second attempt is in flight. */
  isRetrying: boolean;
  /** false when the result was generated but never saved to history. */
  persisted: boolean;
  result: TransformOutput | null;
  plainText: string | null;
  transformationId: string | null;
  error: string | null;
  errorDetails: unknown;
  rateLimit: { remaining?: number; reset_at?: string; resetAt?: string } | null;
}

const INITIAL_STATE: TransformState = {
  status: 'idle',
  isRetrying: false,
  persisted: true,
  result: null,
  plainText: null,
  transformationId: null,
  error: null,
  errorDetails: null,
  rateLimit: null,
};

export function useTransform() {
  const [state, setState] = useState<TransformState>(INITIAL_STATE);

  const transform = useCallback(
    async ({
      resumeText,
      jobDescriptionText,
      optimizationMode,
    }: {
      resumeText: string;
      jobDescriptionText: string;
      optimizationMode?: 'description' | 'title';
    }) => {
      setState((s) => ({ ...s, status: 'loading', isRetrying: false, error: null }));

      const attemptTransform = async (attempt = 1): Promise<void> => {
        try {
          const data = await transformResume({ resumeText, jobDescriptionText, optimizationMode });

          // A successful transform that was not persisted is not a plain
          // success: the user cannot find the result again later.
          const persisted = data.persisted !== false;

          setState({
            status: 'success',
            isRetrying: false,
            persisted,
            result: data.data,
            plainText: data.plain_text,
            transformationId: data.transformation_id,
            error: persisted ? null : 'DATABASE_SAVE_FAILED',
            errorDetails: null,
            rateLimit: data.rate_limit ?? null,
          });

          if (!persisted) {
            toast.warning(
              'Your resume was generated but could not be saved to history. Download it before leaving this page.'
            );
          }
        } catch (err) {
          // api.ts always throws ApiError, so `code` is reliable here; the
          // fallback covers genuinely unexpected throws.
          const code = err instanceof ApiError ? err.code : 'UNKNOWN_ERROR';
          const details = err instanceof ApiError ? err.details : null;
          const resetAt = err instanceof ApiError ? err.resetAt : undefined;

          if (attempt === 1 && RETRY_ERRORS.includes(code)) {
            // The retry used to be entirely silent, so a timeout could double
            // the perceived wait with no explanation. Flag it so the progress
            // UI can say what is happening.
            setState((s) => ({ ...s, isRetrying: true }));
            await new Promise((r) => setTimeout(r, 2000));
            return attemptTransform(2);
          }

          setState((s) => ({
            ...s,
            status: 'error',
            isRetrying: false,
            error: code,
            errorDetails: details,
            rateLimit: resetAt ? { resetAt } : s.rateLimit,
          }));

          // No generic toast here: TransformErrorPanel already renders a
          // specific, actionable message for every code. Firing both gave the
          // user a vague toast contradicting a precise panel.
        }
      };

      await attemptTransform();
    },
    []
  );

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { ...state, transform, reset };
}