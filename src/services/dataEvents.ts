export type DataChangeEvent = {
  type: 'notes' | 'subjects' | 'chapters' | 'reports';
  action: 'create' | 'update' | 'delete';
  id?: string;
  data?: any;
};

type DataSubscriber = (event: DataChangeEvent) => void;

const listeners = new Set<DataSubscriber>();

export const dataEvents = {
  /**
   * Subscribe to global data change events (note added/approved/deleted, subject added, etc.)
   * Returns an unsubscribe cleanup function.
   */
  subscribe(fn: DataSubscriber): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  /**
   * Emit an event to all subscribers across the application so UI updates automatically
   * without needing manual page refreshes.
   */
  emit(event: DataChangeEvent) {
    listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.warn("Data change listener error:", err);
      }
    });
  }
};
