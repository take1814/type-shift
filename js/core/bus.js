const listeners = new Map();

export function on(event, handler) {
  const handlers = listeners.get(event) ?? new Set();
  handlers.add(handler);
  listeners.set(event, handlers);
  return () => handlers.delete(handler);
}

export function emit(event, detail) {
  listeners.get(event)?.forEach((handler) => handler(detail));
}
