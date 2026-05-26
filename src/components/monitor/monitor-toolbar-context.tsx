"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type MonitorToolbarConfig = {
  searchPlaceholder: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isRefreshing: boolean;
  onRefresh: () => void | Promise<void>;
  meta?: string;
  actionsSlot?: ReactNode;
};

type MonitorToolbarState = {
  searchPlaceholder: string;
  searchTerm: string;
  isRefreshing: boolean;
  meta?: string;
  actionsRevision: number;
};

type MonitorToolbarActions = {
  onSearchChange: (value: string) => void;
  onRefresh: () => void | Promise<void>;
  actionsSlot?: ReactNode;
};

const defaultState: MonitorToolbarState = {
  searchPlaceholder: "Buscar...",
  searchTerm: "",
  isRefreshing: false,
  actionsRevision: 0,
};

const defaultActions: MonitorToolbarActions = {
  onSearchChange: () => {},
  onRefresh: () => {},
};

type MonitorToolbarContextValue = {
  state: MonitorToolbarState;
  actionsRef: React.RefObject<MonitorToolbarActions>;
  updateToolbar: (config: MonitorToolbarConfig) => void;
  resetToolbar: () => void;
};

const MonitorToolbarContext = createContext<MonitorToolbarContextValue | null>(
  null,
);

function isToolbarStateEqual(
  prev: MonitorToolbarState,
  next: MonitorToolbarState,
): boolean {
  return (
    prev.searchPlaceholder === next.searchPlaceholder &&
    prev.searchTerm === next.searchTerm &&
    prev.isRefreshing === next.isRefreshing &&
    prev.meta === next.meta &&
    prev.actionsRevision === next.actionsRevision
  );
}

export function MonitorToolbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MonitorToolbarState>(defaultState);
  const actionsRef = useRef<MonitorToolbarActions>(defaultActions);

  const updateToolbar = useCallback((config: MonitorToolbarConfig) => {
    const actionsChanged =
      actionsRef.current.actionsSlot !== config.actionsSlot;

    actionsRef.current = {
      onSearchChange: config.onSearchChange,
      onRefresh: config.onRefresh,
      actionsSlot: config.actionsSlot,
    };

    setState((prev) => {
      const next: MonitorToolbarState = {
        searchPlaceholder: config.searchPlaceholder,
        searchTerm: config.searchTerm,
        isRefreshing: config.isRefreshing,
        meta: config.meta,
        actionsRevision: actionsChanged
          ? prev.actionsRevision + 1
          : prev.actionsRevision,
      };
      return isToolbarStateEqual(prev, next) ? prev : next;
    });
  }, []);

  const resetToolbar = useCallback(() => {
    actionsRef.current = defaultActions;
    setState(defaultState);
  }, []);

  const value = useMemo(
    () => ({ state, actionsRef, updateToolbar, resetToolbar }),
    [state, updateToolbar, resetToolbar],
  );

  return (
    <MonitorToolbarContext.Provider value={value}>
      {children}
    </MonitorToolbarContext.Provider>
  );
}

function useMonitorToolbarContext() {
  const context = useContext(MonitorToolbarContext);
  if (!context) {
    throw new Error(
      "useMonitorToolbar debe usarse dentro de MonitorToolbarProvider",
    );
  }
  return context;
}

export function useMonitorToolbar(config: MonitorToolbarConfig) {
  const { updateToolbar, resetToolbar } = useMonitorToolbarContext();
  const configRef = useRef(config);
  configRef.current = config;

  useLayoutEffect(() => {
    updateToolbar(configRef.current);
  });

  useEffect(() => {
    return () => resetToolbar();
  }, [resetToolbar]);
}

export function useMonitorToolbarState() {
  return useMonitorToolbarContext().state;
}

export function useMonitorToolbarActions() {
  return useMonitorToolbarContext().actionsRef;
}
