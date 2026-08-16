'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  getTransformationEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type ApplicationEvent,
} from '../lib/api';

/**
 * Event timeline CRUD for a transformation.
 *
 * Extracted from TrackingTab, which held this alongside nine form fields, the
 * status selector, and a modal in a single 480-line component.
 */
export function useApplicationEvents(transformationId: string | null | undefined) {
  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Mirrors `events` so the optimistic handlers can read the pre-change list
  // without closing over it — a dependency that rebuilt the callback on every
  // data change and handed the tab a new identity each time.
  const eventsRef = useRef<ApplicationEvent[]>([]);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const load = useCallback(async () => {
    if (!transformationId) return;
    setLoading(true);
    try {
      const data = await getTransformationEvents(transformationId);
      setEvents(data ?? []);
    } catch (err) {
      console.error('Failed to load events', err);
      toast.error('Failed to load events timeline.');
    } finally {
      setLoading(false);
    }
  }, [transformationId]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (eventData: Partial<ApplicationEvent>) => {
      const created = await createEvent({
        transformation_id: transformationId,
        ...eventData,
      });
      setEvents((prev) => [created, ...prev]);
      toast.success('Event logged successfully');
      return created;
    },
    [transformationId]
  );

  const toggleDone = useCallback(async (event: ApplicationEvent) => {
    // Optimistic, with rollback: the previous version awaited the round trip
    // before showing any change.
    const previous = eventsRef.current;
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, is_done: !e.is_done } : e))
    );
    try {
      const updated = await updateEvent(event.id, { is_done: !event.is_done });
      setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
    } catch (err) {
      console.error(err);
      setEvents(previous);
      toast.error('Failed to update event status.');
    }
  }, []);

  const setOutcome = useCallback(async (event: ApplicationEvent, outcome: string) => {
    try {
      const updated = await updateEvent(event.id, { outcome });
      setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
      toast.success(`Interview outcome updated to ${outcome}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update outcome.');
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success('Event removed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete event.');
    }
  }, []);

  return { events, loading, add, toggleDone, setOutcome, remove, reload: load };
}

export default useApplicationEvents;
