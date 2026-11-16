// Installs a SQLite-backed localStorage on iOS/Android; no-op on web (uses the browser's).
import 'expo-sqlite/localStorage/install';
import { useSyncExternalStore } from 'react';

export type Todo = {
  id: string;
  title: string;
  done: boolean;
};

const STORAGE_KEY = 'forge.todos';
const EMPTY: Todo[] = [];

// False during web SSR/static rendering, where no localStorage exists.
const canPersist = () => typeof localStorage !== 'undefined';

function loadTodos(): Todo[] {
  if (!canPersist()) return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Todo[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

// Minimal module-level store; persisted to localStorage (SQLite-backed on native).
let state: Todo[] | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Todo[] {
  if (state === null) state = loadTodos();
  return state;
}

function setState(updater: (prev: Todo[]) => Todo[]) {
  state = updater(getSnapshot());
  if (canPersist()) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTodos() {
  // Server snapshot is empty so SSR output matches the first client render.
  const todos = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const addTodo = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, title: trimmed, done: false },
    ]);
  };

  const toggleTodo = (id: string) => {
    setState((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeTodo = (id: string) => {
    setState((prev) => prev.filter((t) => t.id !== id));
  };

  return { todos, addTodo, toggleTodo, removeTodo };
}
