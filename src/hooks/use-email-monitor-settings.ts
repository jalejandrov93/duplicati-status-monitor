"use client";

import { useCallback, useEffect, useState } from "react";

const HIDDEN_ACCOUNTS_STORAGE_KEY = "email-monitor-hidden-accounts";
const VIEW_MODE_STORAGE_KEY = "email-monitor-view-mode";

export type EmailViewMode = "cards" | "list";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readHiddenAccounts(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = window.localStorage.getItem(HIDDEN_ACCOUNTS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed
        .filter((value): value is string => typeof value === "string")
        .map(normalizeEmail),
    );
  } catch {
    return new Set();
  }
}

function readViewMode(): EmailViewMode {
  if (typeof window === "undefined") return "cards";

  const raw = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return raw === "list" ? "list" : "cards";
}

function persistHiddenAccounts(hiddenEmails: Set<string>): void {
  window.localStorage.setItem(
    HIDDEN_ACCOUNTS_STORAGE_KEY,
    JSON.stringify(Array.from(hiddenEmails)),
  );
}

function persistViewMode(viewMode: EmailViewMode): void {
  window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
}

export function useEmailMonitorSettings() {
  const [hiddenEmails, setHiddenEmails] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<EmailViewMode>("cards");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setHiddenEmails(readHiddenAccounts());
    setViewMode(readViewMode());
    setIsHydrated(true);
  }, []);

  const hideAccount = useCallback((email: string) => {
    const normalized = normalizeEmail(email);
    setHiddenEmails((current) => {
      const next = new Set(current);
      next.add(normalized);
      persistHiddenAccounts(next);
      return next;
    });
  }, []);

  const showAccount = useCallback((email: string) => {
    const normalized = normalizeEmail(email);
    setHiddenEmails((current) => {
      const next = new Set(current);
      next.delete(normalized);
      persistHiddenAccounts(next);
      return next;
    });
  }, []);

  const clearHiddenAccounts = useCallback(() => {
    const next = new Set<string>();
    setHiddenEmails(next);
    persistHiddenAccounts(next);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode((current) => {
      const next = current === "cards" ? "list" : "cards";
      persistViewMode(next);
      return next;
    });
  }, []);

  const setViewModeAndPersist = useCallback((mode: EmailViewMode) => {
    setViewMode(mode);
    persistViewMode(mode);
  }, []);

  const isAccountHidden = useCallback(
    (email: string) => hiddenEmails.has(normalizeEmail(email)),
    [hiddenEmails],
  );

  return {
    hiddenEmails,
    hideAccount,
    showAccount,
    clearHiddenAccounts,
    isAccountHidden,
    viewMode,
    setViewMode: setViewModeAndPersist,
    toggleViewMode,
    isHydrated,
  };
}
