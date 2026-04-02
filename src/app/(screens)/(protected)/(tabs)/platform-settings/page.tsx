/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Gamepad2,
  Wallet,
  Gift,
  Wrench,
  Store,
  History,
  AlertTriangle,
  CheckCircle,
  Save,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Star,
} from 'lucide-react';
import { api } from '@/app/lib/api-client';
import { formatNaira, cn } from '@/app/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlatformSettings {
  id: string;
  // New columns
  standard_entry_fee_kobo: number;
  saturday_entry_fee_kobo: number;
  prize_pool_pct: number;
  platform_cut_pct: number;
  max_players_per_game: number;
  game_duration_seconds: number;
  lobby_open_minutes_before: number;
  min_deposit_kobo: number;
  max_deposit_kobo: number;
  min_withdrawal_kobo: number;
  max_withdrawal_kobo: number;
  withdrawal_processing_hours: number;
  referral_bonus_kobo: number;
  referral_max_earnings_kobo: number;
  maintenance_mode: boolean;
  maintenance_message: string;
  // Existing columns
  qmcoin_entry_rate: number;
  h2h_platform_fee_percent: number;
  scratch_card_price_kobo: number;
  streak_restore_cost_kobo: number;
  daily_challenge_qmcoin_reward: number;
  referral_referrer_reward: number;
  referral_referee_reward: number;
  updated_at: string;
}

interface StoreBundle {
  id: string;
  item_type: 'eraser' | 'scratch_card' | 'qmcoin';
  name: string;
  quantity: number;
  price_kobo: number;
  bonus_qty: number;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

interface HistoryEntry {
  id: string;
  admin_username: string;
  section: string;
  action: string;
  created_at: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────
const settingsApi = {
  get: () =>
    api.get('/api/admin/settings').then(
      (r) =>
        r.data.data as {
          settings: PlatformSettings;
          bundles: Record<string, StoreBundle[]>;
        },
    ),
  history: () =>
    api
      .get('/api/admin/settings/history')
      .then((r) => r.data.data as HistoryEntry[]),
  updateGame: (body: any) => api.patch('/api/admin/settings/game', body),
  updateEconomy: (body: any) => api.patch('/api/admin/settings/economy', body),
  updateFinancial: (body: any) =>
    api.patch('/api/admin/settings/financial', body),
  updateReferral: (body: any) =>
    api.patch('/api/admin/settings/referral', body),
  updateMaintenance: (body: any) =>
    api.patch('/api/admin/settings/maintenance', body),
  updateBundle: (id: string, body: any) =>
    api.patch(`/api/admin/settings/bundles/${id}`, body),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const koboToNaira = (k: number) => (k / 100).toString();
const nairaToKobo = (n: string) => Math.round(parseFloat(n) * 100);
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const SECTION_COLORS: Record<string, string> = {
  game: 'bg-blue-100 text-blue-700',
  financial: 'bg-green-100 text-green-700',
  referral: 'bg-purple-100 text-purple-700',
  maintenance: 'bg-red-100 text-red-600',
  store: 'bg-orange-100 text-orange-700',
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────
const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

function NairaInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
          ₦
        </span>
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} pl-7`}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  suffix,
  min,
  max,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  min?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function SaveButton({
  loading,
  onClick,
  disabled,
}: {
  loading: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="mt-4 flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
    >
      <Save className="h-4 w-4" />
      {loading ? 'Saving…' : 'Save Changes'}
    </button>
  );
}

// ─── Bundle edit row ──────────────────────────────────────────────────────────
function BundleRow({
  bundle,
  onSave,
}: {
  bundle: StoreBundle;
  onSave: (id: string, payload: any) => Promise<void>;
}) {
  const [price, setPrice] = useState(koboToNaira(bundle.price_kobo));
  const [quantity, setQuantity] = useState(String(bundle.quantity));
  const [bonusQty, setBonusQty] = useState(String(bundle.bonus_qty));
  const [isPopular, setIsPopular] = useState(bundle.is_popular);
  const [isActive, setIsActive] = useState(bundle.is_active);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const markDirty = (fn: () => void) => {
    fn();
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(bundle.id, {
        price_kobo: nairaToKobo(price),
        quantity: Number(quantity),
        bonus_qty: Number(bonusQty),
        is_popular: isPopular,
        is_active: isActive,
      });
      setDirty(false);
      toast.success(`${bundle.name} bundle updated`);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-100 p-4 transition-colors',
        dirty ? 'border-blue-200 bg-blue-50/30' : '',
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">
            {bundle.name}
          </span>
          {isPopular && (
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Active toggle */}
          <button
            onClick={() => markDirty(() => setIsActive((a) => !a))}
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
              isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500',
            )}
          >
            {isActive ? (
              <ToggleRight className="h-3.5 w-3.5" />
            ) : (
              <ToggleLeft className="h-3.5 w-3.5" />
            )}
            {isActive ? 'Active' : 'Inactive'}
          </button>
          {/* Popular toggle */}
          <button
            onClick={() => markDirty(() => setIsPopular((p) => !p))}
            className={cn(
              'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
              isPopular
                ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50',
            )}
          >
            <Star className="h-3 w-3" />
            {isPopular ? 'Featured' : 'Feature'}
          </button>
        </div>
      </div>
      <div
        className={cn(
          'grid gap-3',
          bundle.item_type === 'qmcoin' ? 'grid-cols-3' : 'grid-cols-2',
        )}
      >
        <div>
          <label className={labelCls}>Price (₦)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              ₦
            </span>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => markDirty(() => setPrice(e.target.value))}
              className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => markDirty(() => setQuantity(e.target.value))}
            className={inputCls}
          />
        </div>
        {bundle.item_type === 'qmcoin' && (
          <div>
            <label className={labelCls}>Bonus Coins</label>
            <input
              type="number"
              min="0"
              value={bonusQty}
              onChange={(e) => markDirty(() => setBonusQty(e.target.value))}
              className={inputCls}
            />
          </div>
        )}
      </div>
      {dirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      )}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'game', label: 'Game', icon: <Gamepad2 className="h-4 w-4" /> },
  { key: 'economy', label: 'Economy', icon: <Star className="h-4 w-4" /> },
  {
    key: 'financial',
    label: 'Financial',
    icon: <Wallet className="h-4 w-4" />,
  },
  { key: 'store', label: 'Store', icon: <Store className="h-4 w-4" /> },
  { key: 'referral', label: 'Referral', icon: <Gift className="h-4 w-4" /> },
  {
    key: 'maintenance',
    label: 'Maintenance',
    icon: <Wrench className="h-4 w-4" />,
  },
  { key: 'history', label: 'History', icon: <History className="h-4 w-4" /> },
] as const;

type Tab = (typeof TABS)[number]['key'];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PlatformSettingsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('game');

  const { data, isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: settingsApi.get,
    staleTime: 60_000,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['platform-settings-history'],
    queryFn: settingsApi.history,
    staleTime: 30_000,
  });

  const settings = data?.settings;
  const bundles = data?.bundles;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['platform-settings'] });
    qc.invalidateQueries({ queryKey: ['platform-settings-history'] });
  };

  // ── Game Economy state ────────────────────────────────
  const [qmcoinEntryRate, setQmcoinEntryRate] = useState('');
  const [h2hFee, setH2hFee] = useState('');
  const [scratchCardPrice, setScratchCardPrice] = useState('');
  const [streakRestoreCost, setStreakRestoreCost] = useState('');
  const [dailyChallengeReward, setDailyChallengeReward] = useState('');
  const [referrerReward, setReferrerReward] = useState('');
  const [refereeReward, setRefereeReward] = useState('');

  // ── Game Settings state ───────────────────────────────────
  const [standardFee, setStandardFee] = useState('');
  const [saturdayFee, setSaturdayFee] = useState('');
  const [prizePct, setPrizePct] = useState('');
  const [platformPct, setPlatformPct] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [gameDuration, setGameDuration] = useState('');
  const [lobbyMin, setLobbyMin] = useState('');

  // ── Financial state ───────────────────────────────────────
  const [minDeposit, setMinDeposit] = useState('');
  const [maxDeposit, setMaxDeposit] = useState('');
  const [minWithdraw, setMinWithdraw] = useState('');
  const [maxWithdraw, setMaxWithdraw] = useState('');
  const [procHours, setProcHours] = useState('');

  // ── Referral state ────────────────────────────────────────
  const [refBonus, setRefBonus] = useState('');
  const [refMax, setRefMax] = useState('');

  // ── Maintenance state ─────────────────────────────────────
  const [maintMode, setMaintMode] = useState(false);
  const [maintMsg, setMaintMsg] = useState('');

  // Pre-fill on load
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    if (settings && !prefilled) {
      setQmcoinEntryRate(String(settings.qmcoin_entry_rate));
      setH2hFee(String(settings.h2h_platform_fee_percent));
      setScratchCardPrice(koboToNaira(settings.scratch_card_price_kobo));
      setStreakRestoreCost(koboToNaira(settings.streak_restore_cost_kobo));
      setDailyChallengeReward(String(settings.daily_challenge_qmcoin_reward));
      setReferrerReward(String(settings.referral_referrer_reward));
      setRefereeReward(String(settings.referral_referee_reward));
      setStandardFee(koboToNaira(settings.standard_entry_fee_kobo));
      setSaturdayFee(koboToNaira(settings.saturday_entry_fee_kobo));
      setPrizePct(String(settings.prize_pool_pct));
      setPlatformPct(String(settings.platform_cut_pct));
      setMaxPlayers(String(settings.max_players_per_game));
      setGameDuration(String(settings.game_duration_seconds));
      setLobbyMin(String(settings.lobby_open_minutes_before));
      setMinDeposit(koboToNaira(settings.min_deposit_kobo));
      setMaxDeposit(koboToNaira(settings.max_deposit_kobo));
      setMinWithdraw(koboToNaira(settings.min_withdrawal_kobo));
      setMaxWithdraw(koboToNaira(settings.max_withdrawal_kobo));
      setProcHours(String(settings.withdrawal_processing_hours));
      setRefBonus(koboToNaira(settings.referral_bonus_kobo));
      setRefMax(koboToNaira(settings.referral_max_earnings_kobo));
      setMaintMode(settings.maintenance_mode);
      setMaintMsg(settings.maintenance_message);
      setPrefilled(true);
    }
  }, [settings, prefilled]);

  // Mutations
  const economyMut = useMutation({
    mutationFn: () =>
      settingsApi.updateEconomy({
        qmcoin_entry_rate: Number(qmcoinEntryRate),
        h2h_platform_fee_percent: Number(h2hFee),
        scratch_card_price_kobo: nairaToKobo(scratchCardPrice),
        streak_restore_cost_kobo: nairaToKobo(streakRestoreCost),
        daily_challenge_qmcoin_reward: Number(dailyChallengeReward),
        referral_referrer_reward: Number(referrerReward),
        referral_referee_reward: Number(refereeReward),
      }),
    onSuccess: () => {
      invalidate();
      toast.success('Economy settings saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  const gameMut = useMutation({
    mutationFn: () =>
      settingsApi.updateGame({
        standard_entry_fee_kobo: nairaToKobo(standardFee),
        saturday_entry_fee_kobo: nairaToKobo(saturdayFee),
        prize_pool_pct: Number(prizePct),
        platform_cut_pct: Number(platformPct),
        max_players_per_game: Number(maxPlayers),
        game_duration_seconds: Number(gameDuration),
        lobby_open_minutes_before: Number(lobbyMin),
      }),
    onSuccess: () => {
      invalidate();
      toast.success('Game settings saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  const financialMut = useMutation({
    mutationFn: () =>
      settingsApi.updateFinancial({
        min_deposit_kobo: nairaToKobo(minDeposit),
        max_deposit_kobo: nairaToKobo(maxDeposit),
        min_withdrawal_kobo: nairaToKobo(minWithdraw),
        max_withdrawal_kobo: nairaToKobo(maxWithdraw),
        withdrawal_processing_hours: Number(procHours),
      }),
    onSuccess: () => {
      invalidate();
      toast.success('Financial settings saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  const referralMut = useMutation({
    mutationFn: () =>
      settingsApi.updateReferral({
        referral_bonus_kobo: nairaToKobo(refBonus),
        referral_max_earnings_kobo: nairaToKobo(refMax),
      }),
    onSuccess: () => {
      invalidate();
      toast.success('Referral settings saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  const maintMut = useMutation({
    mutationFn: () =>
      settingsApi.updateMaintenance({ enabled: maintMode, message: maintMsg }),
    onSuccess: () => {
      invalidate();
      toast.success(
        maintMode ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
      );
    },
    onError: () => toast.error('Failed to save'),
  });

  const handleBundleSave = async (id: string, payload: any) => {
    await settingsApi.updateBundle(id, payload);
    invalidate();
  };

  // Prize + platform must sum to 100
  const pctValid = Number(prizePct) + Number(platformPct) === 100;

  if (isLoading)
    return (
      <div className="space-y-4 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage all QuizMoney platform configuration
        </p>
      </div>

      {/* Maintenance banner */}
      {settings?.maintenance_mode && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm font-medium text-red-700">
            Maintenance mode is currently active — the app is unavailable to
            players.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                '-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {t.icon} {t.label}
              {t.key === 'maintenance' && settings?.maintenance_mode && (
                <span className="h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Game Settings ─────────────────────────────────── */}
      {tab === 'game' && (
        <Section
          title="Game Settings"
          description="Configure entry fees, prize pools, and game mechanics"
          icon={<Gamepad2 className="h-5 w-5" />}
        >
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700">
                Entry Fees
              </p>
              <div className="grid grid-cols-2 gap-4">
                <NairaInput
                  label="Standard Entry Fee"
                  value={standardFee}
                  onChange={setStandardFee}
                  hint="Weekday games"
                />
                <NairaInput
                  label="Saturday Premium Entry"
                  value={saturdayFee}
                  onChange={setSaturdayFee}
                  hint="Saturday games"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700">
                Revenue Split
              </p>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Prize Pool %"
                  value={prizePct}
                  onChange={(v) => {
                    setPrizePct(v);
                    setPlatformPct(String(100 - Number(v)));
                  }}
                  suffix="%"
                  min={1}
                  max={99}
                />
                <NumberInput
                  label="Platform Cut %"
                  value={platformPct}
                  onChange={(v) => {
                    setPlatformPct(v);
                    setPrizePct(String(100 - Number(v)));
                  }}
                  suffix="%"
                  min={1}
                  max={99}
                />
              </div>
              {!pctValid && (
                <p className="mt-1 text-xs text-red-500">
                  Prize pool % + Platform cut % must equal 100%
                </p>
              )}
              {pctValid && (
                <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" /> Split is valid (100%)
                </p>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700">
                Game Mechanics
              </p>
              <div className="grid grid-cols-3 gap-4">
                <NumberInput
                  label="Max Players per Game"
                  value={maxPlayers}
                  onChange={setMaxPlayers}
                />
                <NumberInput
                  label="Time per Question"
                  value={gameDuration}
                  onChange={setGameDuration}
                  suffix="sec"
                  hint="Seconds per question"
                />
                <NumberInput
                  label="Lobby Opens Before"
                  value={lobbyMin}
                  onChange={setLobbyMin}
                  suffix="min"
                  hint="Minutes before game starts"
                />
              </div>
            </div>

            <SaveButton
              loading={gameMut.isPending}
              onClick={() => gameMut.mutate()}
              disabled={!pctValid}
            />
          </div>
        </Section>
      )}

      {/* ── Game Economy ──────────────────────────────────── */}
      {tab === 'economy' && (
        <Section
          title="Game Economy"
          description="QM Coin rates, H2H fees, rewards and in-game costs"
          icon={<Star className="h-5 w-5" />}
        >
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700">
                QM Coin Rates
              </p>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="QM Coin Entry Rate"
                  value={qmcoinEntryRate}
                  onChange={setQmcoinEntryRate}
                  suffix="QMC"
                  hint="Coins required for 1 free game entry"
                />
                <NumberInput
                  label="Daily Challenge Reward"
                  value={dailyChallengeReward}
                  onChange={setDailyChallengeReward}
                  suffix="QMC"
                  hint="Coins awarded for completing daily challenge"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700">
                Referral Coin Rewards
              </p>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Referrer Reward"
                  value={referrerReward}
                  onChange={setReferrerReward}
                  suffix="QMC"
                  hint="Coins given to the player who referred"
                />
                <NumberInput
                  label="Referee Reward"
                  value={refereeReward}
                  onChange={setRefereeReward}
                  suffix="QMC"
                  hint="Coins given to the newly referred player"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700">
                In-Game Costs
              </p>
              <div className="grid grid-cols-3 gap-4">
                <NairaInput
                  label="Scratch Card Unit Price"
                  value={scratchCardPrice}
                  onChange={setScratchCardPrice}
                  hint="Price per single scratch card"
                />
                <NairaInput
                  label="Streak Restore Cost"
                  value={streakRestoreCost}
                  onChange={setStreakRestoreCost}
                  hint="Cost to restore a broken streak"
                />
                <NumberInput
                  label="H2H Platform Fee"
                  value={h2hFee}
                  onChange={setH2hFee}
                  suffix="%"
                  min={0}
                  max={50}
                  hint="Platform cut from head-to-head games"
                />
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="mb-1 text-xs font-semibold text-amber-700">
                Current Economy Summary
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-amber-700">
                <span>
                  Free entry: <strong>{qmcoinEntryRate} QMC</strong>
                </span>
                <span>
                  Daily reward: <strong>{dailyChallengeReward} QMC</strong>
                </span>
                <span>
                  H2H fee: <strong>{h2hFee}%</strong>
                </span>
                <span>
                  Referrer: <strong>{referrerReward} QMC</strong>
                </span>
                <span>
                  Referee: <strong>{refereeReward} QMC</strong>
                </span>
                <span>
                  Streak restore:{' '}
                  <strong>
                    ₦
                    {scratchCardPrice
                      ? Number(scratchCardPrice).toLocaleString()
                      : '—'}
                  </strong>
                </span>
              </div>
            </div>

            <SaveButton
              loading={economyMut.isPending}
              onClick={() => economyMut.mutate()}
            />
          </div>
        </Section>
      )}

      {/* ── Financial Settings ────────────────────────────── */}
      {tab === 'financial' && (
        <Section
          title="Financial Settings"
          description="Deposit, withdrawal limits and processing times"
          icon={<Wallet className="h-5 w-5" />}
        >
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700">
                Deposit Limits
              </p>
              <div className="grid grid-cols-2 gap-4">
                <NairaInput
                  label="Minimum Deposit"
                  value={minDeposit}
                  onChange={setMinDeposit}
                />
                <NairaInput
                  label="Maximum Deposit"
                  value={maxDeposit}
                  onChange={setMaxDeposit}
                />
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700">
                Withdrawal Limits
              </p>
              <div className="grid grid-cols-3 gap-4">
                <NairaInput
                  label="Minimum Withdrawal"
                  value={minWithdraw}
                  onChange={setMinWithdraw}
                />
                <NairaInput
                  label="Maximum Withdrawal"
                  value={maxWithdraw}
                  onChange={setMaxWithdraw}
                />
                <NumberInput
                  label="Processing Time"
                  value={procHours}
                  onChange={setProcHours}
                  suffix="hrs"
                  hint="Admin review window"
                />
              </div>
            </div>
            <SaveButton
              loading={financialMut.isPending}
              onClick={() => financialMut.mutate()}
            />
          </div>
        </Section>
      )}

      {/* ── Store Settings ────────────────────────────────── */}
      {tab === 'store' && (
        <div className="space-y-5">
          {/* Erasers */}
          <Section
            title="Eraser Bundles"
            description="Pricing for eraser packs sold in the store"
            icon={<Store className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {(bundles?.eraser ?? []).map((b) => (
                <BundleRow key={b.id} bundle={b} onSave={handleBundleSave} />
              ))}
            </div>
          </Section>

          {/* Scratch Cards */}
          <Section
            title="Scratch Card Bundles"
            description="Pricing for scratch card packs"
            icon={<Store className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {(bundles?.scratch_card ?? []).map((b) => (
                <BundleRow key={b.id} bundle={b} onSave={handleBundleSave} />
              ))}
            </div>
          </Section>

          {/* QM Coins */}
          <Section
            title="QM Coin Bundles"
            description="Coin packages available for purchase — includes bonus coins"
            icon={<Store className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {(bundles?.qmcoin ?? []).map((b) => (
                <BundleRow key={b.id} bundle={b} onSave={handleBundleSave} />
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ── Referral Settings ─────────────────────────────── */}
      {tab === 'referral' && (
        <Section
          title="Referral Settings"
          description="Bonus amounts awarded for successful player referrals"
          icon={<Gift className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <NairaInput
                label="Referral Bonus per Signup"
                value={refBonus}
                onChange={setRefBonus}
                hint="Credited to referrer when referee makes first deposit"
              />
              <NairaInput
                label="Max Total Referral Earnings"
                value={refMax}
                onChange={setRefMax}
                hint="Lifetime cap per player"
              />
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="mb-1 text-xs font-medium text-blue-700">
                How referrals work
              </p>
              <p className="text-xs text-blue-600">
                When a referred player signs up using a referral code and makes
                their first deposit, the referrer receives{' '}
                <strong>
                  {refBonus ? `₦${Number(refBonus).toLocaleString()}` : '—'}
                </strong>{' '}
                credited to their wallet. Maximum lifetime earnings per
                referrer:{' '}
                <strong>
                  {refMax ? `₦${Number(refMax).toLocaleString()}` : '—'}
                </strong>
                .
              </p>
            </div>
            <SaveButton
              loading={referralMut.isPending}
              onClick={() => referralMut.mutate()}
            />
          </div>
        </Section>
      )}

      {/* ── Maintenance ───────────────────────────────────── */}
      {tab === 'maintenance' && (
        <Section
          title="Maintenance Mode"
          description="Take the platform offline for updates or emergency fixes"
          icon={<Wrench className="h-5 w-5" />}
        >
          <div className="space-y-5">
            {/* Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Maintenance Mode
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {maintMode
                    ? 'Platform is currently offline for players.'
                    : 'Platform is live and accessible to players.'}
                </p>
              </div>
              <button
                onClick={() => setMaintMode((m) => !m)}
                className={cn(
                  'relative h-6 w-12 rounded-full transition-colors duration-200',
                  maintMode ? 'bg-red-500' : 'bg-gray-200',
                )}
              >
                <span
                  className={cn(
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                    maintMode ? 'translate-x-6' : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            {/* Message */}
            <div>
              <label className={labelCls}>Message shown to players</label>
              <textarea
                value={maintMsg}
                onChange={(e) => setMaintMsg(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="QuizMoney is currently undergoing scheduled maintenance..."
              />
            </div>

            {maintMode && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-xs text-red-700">
                  Enabling maintenance mode will immediately prevent all players
                  from accessing the app.
                </p>
              </div>
            )}

            <SaveButton
              loading={maintMut.isPending}
              onClick={() => maintMut.mutate()}
            />
          </div>
        </Section>
      )}

      {/* ── History ───────────────────────────────────────── */}
      {tab === 'history' && (
        <Section
          title="Settings Change History"
          description="Audit log of all platform configuration changes"
          icon={<History className="h-5 w-5" />}
        >
          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No changes recorded yet
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium capitalize',
                        SECTION_COLORS[h.section] ??
                          'bg-gray-100 text-gray-600',
                      )}
                    >
                      {h.section}
                    </span>
                    <span className="text-sm text-gray-700">{h.action}</span>
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    <p className="text-xs font-medium text-gray-600">
                      {h.admin_username}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(h.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
