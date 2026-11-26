/*
 * App-wide UI state and user preferences: favourites, follows, filters, the
 * Bet Builder settings, sheets, toasts, onboarding and the signed-in user.
 * Favourites, follows, settings and the user are saved on the device.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import type { TextInput } from 'react-native';
type TextInputRef = React.ComponentRef<typeof TextInput>;
import { isSampleData } from '../services/api';
import { load, save } from '../services/storage';
import { signOut as authSignOut } from '../services/auth';
import type { CompId, CompTab, Filters, InfoPage, Match, SheetName, TeamId, User } from '../types';
import { useData } from './DataProvider';

export type Tab = 'Bankers' | 'All matches' | 'Bet Builder' | 'Favourites' | 'Account';

export const TAB_ROUTES: Record<Tab, string> = {
  Bankers: 'index',
  'All matches': 'matches',
  'Bet Builder': 'builder',
  Favourites: 'favourites',
  Account: 'account',
};
const TAB_HREF: Record<Tab, string> = {
  Bankers: '/',
  'All matches': '/matches',
  'Bet Builder': '/builder',
  Favourites: '/favourites',
  Account: '/account',
};

export const DEFAULT_FILTERS: Filters = { status: 'all', groups: [], minP: 0, comps: [], sort: 'league' };

export type BuilderSettings = {
  type: 'All' | 'Featured' | 'Live';
  day: 'today' | 'tomorrow' | 'both';
  count: number;
  total: number;
  minOdd: number;
  maxOdd: number;
  minP: number;
};
export const DEFAULT_BUILDER: BuilderSettings = { type: 'All', day: 'today', count: 4, total: 10, minOdd: 1.05, maxOdd: 3, minP: 55 };

type Toast = { text: string; undo?: () => void } | null;

function useAppState() {
  const data = useData();

  /* ---------- browsing ---------- */
  const [currentTab, setCurrentTab] = useState<Tab>('Bankers');
  const [day, setDay] = useState(0);
  const [bankersView, setBankersView] = useState<'picks' | 'slip'>('picks');
  const [bankersFocus, setBankersFocus] = useState<'All' | 'Following' | 'Nigeria'>('All');
  const [query, setQuery] = useState('');
  const [liveOnly, setLiveOnly] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [collapsed, setCollapsed] = useState<CompId[]>([]);
  const [favSegment, setFavSegment] = useState<'Matches' | 'Teams' | 'Competitions'>('Matches');
  const [sheet, setSheet] = useState<SheetName | null>(null);
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const searchRef = useRef<TextInputRef>(null);

  /* ---------- saved on device ---------- */
  const [hydrated, setHydrated] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [followTeams, setFollowTeams] = useState<TeamId[]>([]);
  /* Default follows: NPFL and Premier League (sample ids, then API-Football league ids). */
  const [followComps, setFollowComps] = useState<CompId[]>(isSampleData() ? ['npfl', 'epl'] : ['399', '39']);
  const [notify, setNotify] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [onboarded, setOnboarded] = useState(false);

  /* ---------- demo / session ---------- */
  const [isPlus, setIsPlus] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [authReturn, setAuthReturn] = useState(false);
  const [ageOk, setAgeOk] = useState(false);
  const [builder, setBuilder] = useState<BuilderSettings>(DEFAULT_BUILDER);
  const [builderSlip, setBuilderSlip] = useState<string[] | null>(null);

  /* ---------- toast ---------- */
  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((text: string, undo?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, undo });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  /* ---------- persistence ---------- */
  useEffect(() => {
    (async () => {
      const [sv, ft, fc, nt, rm, us, ob] = await Promise.all([
        load<string[]>('savedIds'),
        load<string[]>('followTeams'),
        load<string[]>('followComps'),
        load<boolean>('notify'),
        load<boolean>('reminders'),
        load<User | null>('user'),
        load<boolean>('onboarded'),
      ]);
      if (sv) setSavedIds(sv);
      if (ft) setFollowTeams(ft);
      if (fc) setFollowComps(fc);
      if (nt !== undefined) setNotify(nt);
      if (rm !== undefined) setReminders(rm);
      if (us !== undefined) setUser(us);
      if (ob) setOnboarded(true);
      setHydrated(true);
    })();
  }, []);
  useEffect(() => {
    if (hydrated) save('savedIds', savedIds);
  }, [hydrated, savedIds]);
  useEffect(() => {
    if (hydrated) save('followTeams', followTeams);
  }, [hydrated, followTeams]);
  useEffect(() => {
    if (hydrated) save('followComps', followComps);
  }, [hydrated, followComps]);
  useEffect(() => {
    if (hydrated) save('notify', notify);
  }, [hydrated, notify]);
  useEffect(() => {
    if (hydrated) save('reminders', reminders);
  }, [hydrated, reminders]);
  useEffect(() => {
    if (hydrated) save('user', user);
  }, [hydrated, user]);
  useEffect(() => {
    if (hydrated) save('onboarded', onboarded);
  }, [hydrated, onboarded]);

  /* ---------- navigation ---------- */
  const goTab = useCallback(
    (t: Tab) => {
      if (t === 'All matches' && t !== currentTab) setFilters((f) => ({ ...f, sort: 'league' }));
      if (router.canDismiss()) router.dismissAll();
      router.navigate(TAB_HREF[t] as never);
    },
    [currentTab],
  );
  const openMatch = useCallback((m: Match | string) => router.push(`/match/${typeof m === 'string' ? m : m.id}` as never), []);
  const openTeam = useCallback((id: TeamId) => router.push(`/team/${id}` as never), []);
  const openComp = useCallback(
    (id: CompId, tab: CompTab = 'Predictions') => router.push(`/competition/${id}?tab=${encodeURIComponent(tab)}` as never),
    [],
  );
  const openRecord = useCallback(() => router.push('/record' as never), []);
  const openPremium = useCallback(() => router.push('/premium' as never), []);
  const openLeagues = useCallback(() => router.push('/competitions' as never), []);
  const openPage = useCallback((page: InfoPage) => router.push(`/info/${page}` as never), []);
  const openSearch = useCallback(() => {
    goTab('All matches');
    setTimeout(() => searchRef.current?.focus(), 250);
  }, [goTab]);

  /* ---------- favourites and follows ---------- */
  const toggleSaved = useCallback(
    (m: Match) => {
      const was = savedIds.includes(m.id);
      setSavedIds((ids) => (was ? ids.filter((i) => i !== m.id) : [...ids, m.id]));
      showToast(was ? 'Removed from Favourites' : 'Saved to Favourites', () =>
        setSavedIds((ids) => (was ? [...ids, m.id] : ids.filter((i) => i !== m.id))),
      );
    },
    [savedIds, showToast],
  );
  const toggleTeam = useCallback(
    (id: TeamId) => {
      const was = followTeams.includes(id);
      setFollowTeams((ids) => (was ? ids.filter((i) => i !== id) : [...ids, id]));
      showToast(was ? `Unfollowed ${data.team(id).name}` : `Following ${data.team(id).name}`);
    },
    [followTeams, showToast, data],
  );
  const toggleComp = useCallback(
    (id: CompId) => {
      const was = followComps.includes(id);
      setFollowComps((ids) => (was ? ids.filter((i) => i !== id) : [...ids, id]));
      showToast(was ? `Unfollowed ${data.comp(id).name}` : `Following ${data.comp(id).name}`);
    },
    [followComps, showToast, data],
  );

  /** Premium insight hidden until the user has Plus. Settled picks are always shown. */
  const locked = useCallback((m: Match) => !!m.premium && !isPlus && m.status !== 'finished', [isPlus]);

  /* ---------- account ---------- */
  const startSignIn = useCallback(() => {
    setAuthMode('signin');
    setAuthReturn(true);
    setOnboardStep(1);
    setOnboarded(false);
  }, []);
  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
    showToast('Signed out');
  }, [showToast]);
  const afterAuth = useCallback(() => {
    if (authReturn) {
      setAuthReturn(false);
      setOnboarded(true);
    } else setOnboardStep(2);
  }, [authReturn]);
  const replayWelcome = useCallback(() => {
    setOnboardStep(0);
    setAgeOk(false);
    setOnboarded(false);
  }, []);
  const finishOnboarding = useCallback(() => {
    setOnboarded(true);
    goTab('Bankers');
  }, [goTab]);

  return {
    currentTab,
    setCurrentTab,
    day,
    setDay,
    bankersView,
    setBankersView,
    bankersFocus,
    setBankersFocus,
    query,
    setQuery,
    liveOnly,
    setLiveOnly,
    filters,
    setFilters,
    draft,
    setDraft,
    collapsed,
    setCollapsed,
    favSegment,
    setFavSegment,
    sheet,
    setSheet,
    calMonth,
    setCalMonth,
    searchRef,
    hydrated,
    savedIds,
    setSavedIds,
    followTeams,
    setFollowTeams,
    followComps,
    setFollowComps,
    notify,
    setNotify,
    reminders,
    setReminders,
    user,
    setUser,
    onboarded,
    setOnboarded,
    isPlus,
    setIsPlus,
    onboardStep,
    setOnboardStep,
    authMode,
    setAuthMode,
    authReturn,
    setAuthReturn,
    ageOk,
    setAgeOk,
    builder,
    setBuilder,
    builderSlip,
    setBuilderSlip,
    toast,
    setToast,
    showToast,
    goTab,
    openMatch,
    openTeam,
    openComp,
    openRecord,
    openPremium,
    openLeagues,
    openPage,
    openSearch,
    toggleSaved,
    toggleTeam,
    toggleComp,
    locked,
    startSignIn,
    signOut,
    afterAuth,
    replayWelcome,
    finishOnboarding,
  };
}

export type AppState = ReturnType<typeof useAppState>;
const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
