import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SOCIAL_NETWORKS } from '../constants';
import {
  Role,
  SocialMediaEntry,
  SocialFeedConnection,
  SocialMediaFormState,
  SocialNetwork,
  SocialAutoSyncCadence,
} from '../types';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationProvider';

interface SocialMediaProps {
  role: Role;
  teamId: number;
  userId: string;
}

interface SocialMediaEntryRow {
  id: number;
  network: string;
  title: string;
  url: string;
  placement: string;
  notes: string | null;
  created_at: string;
  team_id: number;
  user_id: string;
}

interface SocialFeedConnectionRow {
  id: number;
  network: string;
  connected: boolean;
  auto_sync_cadence: string | null;
  last_synced: string | null;
}

const AUTO_SYNC_OPTIONS: SocialAutoSyncCadence[] = ['Manual', 'Daily', 'Weekly'];

const normalizeNetwork = (value: string): SocialNetwork =>
  SOCIAL_NETWORKS.includes(value as SocialNetwork) ? (value as SocialNetwork) : 'Other';

const normalizeCadence = (value: string | null): SocialAutoSyncCadence => {
  if (value === 'Daily' || value === 'Weekly') {
    return value;
  }
  return 'Manual';
};

const buildDefaultConnection = (network: SocialNetwork): SocialFeedConnection => ({
  network,
  connected: false,
  autoSync: 'Manual',
});

const createDefaultConnections = (): SocialFeedConnection[] =>
  SOCIAL_NETWORKS.map((network) => buildDefaultConnection(network));

const INITIAL_FORM_STATE: SocialMediaFormState = {
  network: SOCIAL_NETWORKS[0],
  title: '',
  url: '',
  placement: '',
  notes: '',
};

const mapEntryRow = (row: SocialMediaEntryRow): SocialMediaEntry => ({
  id: row.id,
  network: normalizeNetwork(row.network),
  title: row.title,
  url: row.url,
  placement: row.placement,
  notes: row.notes,
  createdAt: row.created_at,
  teamId: row.team_id,
  userId: row.user_id,
});

const mergeConnectionRows = (rows: SocialFeedConnectionRow[]): SocialFeedConnection[] => {
  const map = new Map<SocialNetwork, SocialFeedConnection>();
  createDefaultConnections().forEach((connection) => {
    map.set(connection.network, connection);
  });

  rows.forEach((row) => {
    const network = normalizeNetwork(row.network);
    const existing = map.get(network) ?? buildDefaultConnection(network);
    map.set(network, {
      ...existing,
      id: row.id,
      connected: Boolean(row.connected),
      autoSync: normalizeCadence(row.auto_sync_cadence),
      lastSynced: row.last_synced ?? existing.lastSynced,
    });
  });

  return SOCIAL_NETWORKS.map((network) => map.get(network)!);
};

const SocialMedia: React.FC<SocialMediaProps> = ({ role, teamId, userId }) => {
  const { showToast } = useNotification();
  const [entries, setEntries] = useState<SocialMediaEntry[]>([]);
  const [connections, setConnections] = useState<SocialFeedConnection[]>(createDefaultConnections());
  const [formState, setFormState] = useState<SocialMediaFormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  const isChief = role === 'chief';
  const hasTeamContext = teamId > 0;

  const fetchEntries = useCallback(async () => {
    if (!hasTeamContext) {
      setEntries([]);
      return;
    }

    setIsLoadingEntries(true);
    const { data, error } = await supabase
      .from('social_media_entries')
      .select('id, network, title, url, placement, notes, created_at, team_id, user_id')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching social media entries:', error);
      showToast('Error loading social media entries.', 'error');
      setEntries([]);
    } else {
      setEntries((data ?? []).map(mapEntryRow));
    }

    setIsLoadingEntries(false);
  }, [hasTeamContext, teamId, showToast]);

  const fetchConnections = useCallback(async () => {
    if (!hasTeamContext) {
      setConnections(createDefaultConnections());
      return;
    }

    setIsLoadingConnections(true);
    const { data, error } = await supabase
      .from('social_media_connections')
      .select('id, network, connected, auto_sync_cadence, last_synced')
      .eq('team_id', teamId);

    if (error) {
      console.error('Error fetching social media connections:', error);
      showToast('Error loading feed connections.', 'error');
      setConnections(createDefaultConnections());
    } else {
      setConnections(mergeConnectionRows(data ?? []));
    }

    setIsLoadingConnections(false);
  }, [hasTeamContext, teamId, showToast]);

  useEffect(() => {
    fetchEntries();
    fetchConnections();
  }, [fetchEntries, fetchConnections]);
import React, { useMemo, useState } from 'react';
import { Campaign, Role } from '../types';

const SOCIAL_NETWORKS = ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube', 'Other'] as const;

type SocialNetwork = typeof SOCIAL_NETWORKS[number];

interface SocialMediaEntry {
  id: number;
  network: SocialNetwork;
  title: string;
  url: string;
  placement: string;
  campaignId?: number;
  notes?: string;
  createdAt: string;
}

interface FeedConnection {
  network: SocialNetwork;
  connected: boolean;
  autoSync: 'Manual' | 'Daily' | 'Weekly';
  lastSynced?: string;
}

interface SocialMediaProps {
  role: Role;
  campaigns: Campaign[];
}

type SocialMediaFormState = {
  network: SocialNetwork;
  title: string;
  url: string;
  placement: string;
  notes: string;
  campaignId: string;
};

const INITIAL_CONNECTIONS: FeedConnection[] = SOCIAL_NETWORKS.map((network) => ({
  network,
  connected: false,
  autoSync: 'Manual',
}));

const formatDate = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}).format(new Date(value));

const SocialMedia: React.FC<SocialMediaProps> = ({ role, campaigns }) => {
  const [entries, setEntries] = useState<SocialMediaEntry[]>([]);
  const [connections, setConnections] = useState<FeedConnection[]>(INITIAL_CONNECTIONS);
  const [formState, setFormState] = useState<SocialMediaFormState>({
    network: SOCIAL_NETWORKS[0],
    title: '',
    url: '',
    placement: '',
    notes: '',
    campaignId: '',
  });

  const hasEntries = entries.length > 0;

  const availableCampaigns = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const active = campaigns.filter((campaign) => campaign.end_date >= today);
    return active.length > 0 ? active : campaigns;
  }, [campaigns]);

  const campaignLookup = useMemo(() => {
    return new Map(campaigns.map((campaign) => [campaign.id, campaign.name]));
  }, [campaigns]);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [entries],
  );

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE);
  };

  const handleAddEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    setFormState({
      network: SOCIAL_NETWORKS[0],
      title: '',
      url: '',
      placement: '',
      notes: '',
      campaignId: '',
    });
  };

  const handleAddEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.title.trim() || !formState.url.trim()) {
      return;
    }

    if (!hasTeamContext) {
      showToast('Assign a team before logging social media content.', 'error');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      network: formState.network,
      title: formState.title.trim(),
      url: formState.url.trim(),
      placement: formState.placement.trim(),
      notes: formState.notes?.trim() ? formState.notes.trim() : null,
      user_id: userId,
      team_id: teamId,
    };

    const { error } = await supabase.from('social_media_entries').insert([payload]);

    if (error) {
      console.error('Error saving social media entry:', error);
      showToast(`Unable to save social media entry: ${error.message}`, 'error');
    } else {
      await fetchEntries();
      resetForm();
      showToast('Social media entry saved.', 'success');
    }

    setIsSubmitting(false);
  };

  const handleDeleteEntry = async (id: number) => {
    const previousEntries = [...entries];
    setEntries((prev) => prev.filter((entry) => entry.id !== id));

    const { error } = await supabase.from('social_media_entries').delete().eq('id', id);

    if (error) {
      console.error('Error deleting social media entry:', error);
      showToast(`Unable to delete social media entry: ${error.message}`, 'error');
      setEntries(previousEntries);
    } else {
      showToast('Social media entry deleted.', 'success');
    }
  };

  const toggleConnection = async (network: SocialNetwork) => {
    if (!isChief) {
      return;
    }

    if (!hasTeamContext) {
      showToast('Assign a team before managing feed connections.', 'error');
      return;
    }

    const current = connections.find((connection) => connection.network === network);
    const nextConnection: SocialFeedConnection = {
      ...(current ?? buildDefaultConnection(network)),
      connected: !(current?.connected ?? false),
      lastSynced: !(current?.connected ?? false)
        ? new Date().toISOString()
        : current?.lastSynced ?? null,
    };

    setConnections((prev) =>
      prev.map((connection) => (connection.network === network ? nextConnection : connection)),
    );

    const { error } = await supabase
      .from('social_media_connections')
      .upsert(
        [
          {
            id: current?.id,
            team_id: teamId,
            network,
            connected: nextConnection.connected,
            auto_sync_cadence: nextConnection.autoSync,
            last_synced: nextConnection.lastSynced ?? null,
            updated_by: userId,
          },
        ],
        { onConflict: 'team_id,network' },
      );

    if (error) {
      console.error('Error updating social media connection:', error);
      showToast(`Unable to update ${network} connection: ${error.message}`, 'error');
      setConnections((prev) =>
        prev.map((connection) =>
          connection.network === network ? current ?? buildDefaultConnection(network) : connection,
        ),
      );
      return;
    }

    await fetchConnections();

    showToast(
      nextConnection.connected
        ? `${network} feed connection enabled.`
        : `${network} feed connection disabled.`,
      'success',
    );
  };

  const updateAutoSync = async (network: SocialNetwork, value: SocialAutoSyncCadence) => {
    if (!isChief) {
      return;
    }

    if (!hasTeamContext) {
      showToast('Assign a team before managing feed cadence.', 'error');
      return;
    }

    const current = connections.find((connection) => connection.network === network);
    if (!current) {
      return;
    }

    const updatedConnection = { ...current, autoSync: value };
    setConnections((prev) =>
      prev.map((connection) => (connection.network === network ? updatedConnection : connection)),
    );

    const { error } = await supabase
      .from('social_media_connections')
      .upsert(
        [
          {
            id: current.id,
            team_id: teamId,
            network,
            connected: current.connected,
            auto_sync_cadence: value,
            last_synced: current.lastSynced ?? null,
            updated_by: userId,
          },
        ],
        { onConflict: 'team_id,network' },
      );

    if (error) {
      console.error('Error updating social media auto sync cadence:', error);
      showToast(`Unable to update ${network} cadence: ${error.message}`, 'error');
      setConnections((prev) =>
        prev.map((connection) => (connection.network === network ? current : connection)),
      );
      return;
    }

    await fetchConnections();
    showToast(`${network} feed cadence updated.`, 'success');
    const newEntry: SocialMediaEntry = {
      ...formState,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      campaignId: formState.campaignId ? Number(formState.campaignId) : undefined,
    };

    setEntries((prev) => [newEntry, ...prev]);
    resetForm();
  };

  const handleDeleteEntry = (id: number) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const toggleConnection = (network: SocialNetwork) => {
    setConnections((prev) =>
      prev.map((connection) =>
        connection.network === network
          ? {
              ...connection,
              connected: !connection.connected,
              lastSynced: !connection.connected ? new Date().toISOString() : connection.lastSynced,
            }
          : connection,
      ),
    );
  };

  const updateAutoSync = (network: SocialNetwork, value: FeedConnection['autoSync']) => {
    setConnections((prev) =>
      prev.map((connection) =>
        connection.network === network
          ? {
              ...connection,
              autoSync: value,
            }
          : connection,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md dark:shadow-2xl dark:shadow-navy-950/50">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-4">Social Content Library</h2>
        <p className="text-gray-600 dark:text-navy-300 mb-6">
          Capture the links and placements for the social media content you create across platforms. These entries are private to
          your team and make it easier to reference successful posts later.
        </p>

        {!hasTeamContext && (
          <div className="mb-4 rounded-md border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Join or create a team in your profile before adding social media activity so entries can be shared with your peers.
          </div>
        )}

        <form onSubmit={handleAddEntry} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-navy-800 dark:text-navy-100">
              Social network
              <select
                name="network"
                value={formState.network}
                onChange={handleFormChange}
                disabled={isSubmitting || !hasTeamContext}
                className="mt-1 rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-gray-900 dark:text-white focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue disabled:cursor-not-allowed disabled:opacity-60"
              >
                {SOCIAL_NETWORKS.map((networkOption) => (
                  <option key={networkOption} value={networkOption}>
                    {networkOption}
                className="mt-1 rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-gray-900 dark:text-white focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue"
              >
                {SOCIAL_NETWORKS.map((network) => (
                  <option key={network} value={network}>
                    {network}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-sm font-medium text-navy-800 dark:text-navy-100">
              Content title
              <input
                type="text"
                name="title"
                value={formState.title}
                onChange={handleFormChange}
                placeholder="Spring flood preparedness video"
                required
                disabled={isSubmitting || !hasTeamContext}
                className="mt-1 rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-gray-900 dark:text-white focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue disabled:cursor-not-allowed disabled:opacity-60"
                className="mt-1 rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-gray-900 dark:text-white focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue"
                required
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-navy-800 dark:text-navy-100">
              Link URL
              <input
                type="url"
                name="url"
                value={formState.url}
                onChange={handleFormChange}
                placeholder="https://facebook.com/..."
                required
                disabled={isSubmitting || !hasTeamContext}
                className="mt-1 rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-gray-900 dark:text-white focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="https://"
                className="mt-1 rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-gray-900 dark:text-white focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue"
                required
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-navy-800 dark:text-navy-100">
              Placement / campaign
              Placement or campaign tie-in
              <input
                type="text"
                name="placement"
                value={formState.placement}
                onChange={handleFormChange}
                placeholder="Great Lakes flooding response"
                disabled={isSubmitting || !hasTeamContext}
                className="mt-1 rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-gray-900 dark:text-white focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
                placeholder="Great Lakes Water Safety"
                className="mt-1 rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-gray-900 dark:text-white focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-navy-800 dark:text-navy-100">
              Campaign
              <select
                name="campaignId"
                value={formState.campaignId}
                onChange={handleFormChange}
                className="mt-1 rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-gray-900 dark:text-white focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue"
              >
                <option value="">Not linked</option>
                {availableCampaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </label>
            {campaigns.length === 0 && (
              <p className="md:col-span-2 text-xs text-gray-500 dark:text-navy-300">
                No campaigns yet—create one from the Campaigns screen to link activity.
              </p>
            )}
          </div>

          <label className="flex flex-col text-sm font-medium text-navy-800 dark:text-navy-100">
            Notes
            <textarea
              name="notes"
              value={formState.notes}
              onChange={handleFormChange}
              rows={3}
              placeholder="Any additional distribution details or performance notes"
              disabled={isSubmitting || !hasTeamContext}
              className="mt-1 rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-gray-900 dark:text-white focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Key talking points, imagery cues, or results."
              className="mt-1 h-24 rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-gray-900 dark:text-white focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !hasTeamContext}
              className="inline-flex items-center rounded-md bg-usace-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-usace-blue-dark focus:outline-none focus:ring-2 focus:ring-usace-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : 'Add to library'}
              className="inline-flex items-center rounded-md border border-transparent bg-usace-blue px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-usace-blue focus:ring-offset-2 dark:focus:ring-offset-navy-800"
            >
              Add social link
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md dark:shadow-2xl dark:shadow-navy-950/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-navy-900 dark:text-white">Recent social media activity</h3>
            <p className="text-gray-600 dark:text-navy-300">
              Track what has already been published so future planning can build on proven tactics.
            </p>
          </div>
        </div>

        {isLoadingEntries ? (
          <div className="mt-6 text-sm text-gray-500 dark:text-navy-300">Loading entries…</div>
        ) : sortedEntries.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {sortedEntries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition dark:border-navy-700 dark:bg-navy-900"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-usace-blue">
                      <span>{entry.network}</span>
                      <span aria-hidden="true" className="text-gray-300 dark:text-navy-500">
                        •
                      </span>
                      <time dateTime={entry.createdAt} className="text-xs font-normal text-gray-500 dark:text-navy-300">
                        {new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        }).format(new Date(entry.createdAt))}
                      </time>
                    </div>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-lg font-semibold text-navy-900 hover:underline dark:text-white"
                    >
                      {entry.title}
                    </a>
                    {entry.placement && (
                      <p className="text-sm text-gray-600 dark:text-navy-300">Placement: {entry.placement}</p>
                    )}
                    {entry.notes && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-navy-200">{entry.notes}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="self-start rounded-md border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 dark:border-red-600/50 dark:text-red-300 dark:hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600 dark:border-navy-700 dark:bg-navy-900/40 dark:text-navy-200">
            No social media entries recorded yet. Add the first one above to kickstart your team library.
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-navy-900 dark:text-white">Saved links & placements</h3>
          <span className="text-sm text-gray-500 dark:text-navy-300">{entries.length} item{entries.length === 1 ? '' : 's'}</span>
        </div>

        {hasEntries ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-navy-700">
              <thead>
                <tr className="bg-navy-50 dark:bg-navy-900">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-navy-200">
                    Network
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-navy-200">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-navy-200">
                    Placement
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-navy-200">
                    Campaign
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-navy-200">
                    Added
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-navy-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-navy-700">
                {sortedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-navy-50/60 dark:hover:bg-navy-900/50">
                    <td className="px-4 py-3 text-sm font-medium text-navy-900 dark:text-white">{entry.network}</td>
                    <td className="px-4 py-3 text-sm text-navy-800 dark:text-navy-100">
                      <div className="flex flex-col">
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-usace-blue hover:underline"
                        >
                          {entry.title}
                        </a>
                        {entry.notes && <span className="text-xs text-gray-500 dark:text-navy-300 mt-1">{entry.notes}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-navy-800 dark:text-navy-100">{entry.placement || '—'}</td>
                    <td className="px-4 py-3 text-sm text-navy-800 dark:text-navy-100">
                      {entry.campaignId ? campaignLookup.get(entry.campaignId) ?? '—' : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-navy-800 dark:text-navy-100">{formatDate(entry.createdAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="rounded-md border border-transparent bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50 dark:focus:ring-offset-navy-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-gray-300 dark:border-navy-600 p-8 text-center">
            <h4 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">No social links yet</h4>
            <p className="text-sm text-gray-600 dark:text-navy-300">
              Start building your library by logging the posts your team has published. You can store links, placements, and notes
              for future reporting.
            </p>
          </div>
        )}
      </section>

      <section className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md dark:shadow-2xl dark:shadow-navy-950/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-navy-900 dark:text-white">Automated feeds</h3>
            <p className="text-gray-600 dark:text-navy-300">
              Chiefs can connect official accounts to automatically surface recent posts.
            </p>
          </div>
          {!isChief && (
            <p className="rounded-md border border-navy-200 bg-navy-50 px-3 py-2 text-xs text-navy-700 dark:border-navy-700 dark:bg-navy-900/40 dark:text-navy-200">
              Only chiefs can manage feed connections.
            </p>
          )}
        </div>

        {isLoadingConnections ? (
          <div className="mt-6 text-sm text-gray-500 dark:text-navy-300">Checking feed connections…</div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {connections.map((connection) => (
              <div
                key={connection.network}
                className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-navy-900 dark:text-white">{connection.network}</h4>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        connection.connected
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200'
                          : 'bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-navy-200'
                      }`}
                    >
                      {connection.connected ? 'Connected' : 'Offline'}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600 dark:text-navy-300">
                    {connection.connected
                      ? 'Feed items will populate automatically based on the cadence below.'
                      : 'Connect this feed to automatically ingest recent posts.'}
                  </p>

                  {connection.lastSynced && (
                    <p className="mt-3 text-xs text-gray-500 dark:text-navy-300">
                      Last synced: {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      }).format(new Date(connection.lastSynced))}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => toggleConnection(connection.network)}
                    disabled={!isChief}
                    className="rounded-md border border-usace-blue bg-white px-3 py-1.5 text-sm font-medium text-usace-blue transition hover:bg-usace-blue hover:text-white focus:outline-none focus:ring-2 focus:ring-usace-blue disabled:cursor-not-allowed disabled:opacity-60 dark:bg-navy-900"
                  >
                    {connection.connected ? 'Disconnect feed' : 'Connect feed'}
                  </button>

                  <label className="text-xs font-medium text-gray-600 dark:text-navy-200">
                    Sync cadence
                    <select
                      value={connection.autoSync}
                      onChange={(event) => updateAutoSync(connection.network, event.target.value as SocialAutoSyncCadence)}
                      disabled={!isChief}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue disabled:cursor-not-allowed disabled:opacity-60 dark:border-navy-700 dark:bg-navy-800 dark:text-white"
                    >
                      {AUTO_SYNC_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-navy-900 dark:text-white">Automated feeds</h3>
            <p className="text-sm text-gray-600 dark:text-navy-300">
              Connect official accounts to automatically pull recent activity into the dashboard.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-navy-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-usace-blue dark:bg-navy-900 dark:text-navy-200">
            Chief access
          </span>
        </div>

        {role === 'chief' ? (
          <div className="grid gap-4 md:grid-cols-2">
            {connections.map((connection) => (
              <div
                key={connection.network}
                className="rounded-lg border border-gray-200 bg-navy-50/50 p-4 dark:border-navy-700 dark:bg-navy-900/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-navy-900 dark:text-white">{connection.network}</h4>
                    <p className="text-sm text-gray-600 dark:text-navy-300">
                      Securely authenticate the official page to mirror posts in the metrics hub.
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      connection.connected
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                        : 'bg-gray-200 text-gray-700 dark:bg-navy-800 dark:text-navy-200'
                    }`}
                  >
                    {connection.connected ? 'Connected' : 'Offline'}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-navy-300">
                    Auto-sync frequency
                    <select
                      value={connection.autoSync}
                      onChange={(event) => updateAutoSync(connection.network, event.target.value as FeedConnection['autoSync'])}
                      className="mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue dark:border-navy-600 dark:bg-navy-800 dark:text-white"
                    >
                      <option value="Manual">Manual import</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                  </label>

                  <button
                    onClick={() => toggleConnection(connection.network)}
                    className={`w-full rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-navy-900 ${
                      connection.connected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500'
                        : 'bg-usace-blue text-white hover:bg-navy-800 focus:ring-usace-blue'
                    }`}
                  >
                    {connection.connected ? 'Disconnect feed' : 'Connect account'}
                  </button>

                  {connection.connected && connection.lastSynced && (
                    <p className="text-xs text-gray-500 dark:text-navy-300">
                      Last synced {formatDate(connection.lastSynced)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-gray-300 p-6 text-center dark:border-navy-600">
            <h4 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">Chief tools required</h4>
            <p className="text-sm text-gray-600 dark:text-navy-300">
              Only chief-level users can authorize automated feeds. Coordinate with your public affairs chief if you would like to
              enable API-based imports for your team.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SocialMedia;
