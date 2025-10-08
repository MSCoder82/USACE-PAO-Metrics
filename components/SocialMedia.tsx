import React, { useMemo, useState } from 'react';
import { Campaign, Role } from '../types';

const SOCIAL_NETWORKS = ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube', 'Other'] as const;

type SocialNetwork = typeof SOCIAL_NETWORKS[number];

interface MockFeedItem {
  title: string;
  url: string;
  placement: string;
  notes: string;
  hoursAgo: number;
}

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

const MOCK_FEED_LIBRARY: Record<SocialNetwork, MockFeedItem[]> = {
  Facebook: [
    {
      title: 'Lake shoreline restoration update',
      url: 'https://facebook.com/usace/posts/shoreline-restoration',
      placement: 'Regional operations',
      notes: 'Highlights before/after photos and upcoming milestones.',
      hoursAgo: 5,
    },
    {
      title: 'STEM outreach day recap',
      url: 'https://facebook.com/usace/posts/stem-outreach',
      placement: 'Community engagement',
      notes: 'Includes partner shout-outs and photo gallery link.',
      hoursAgo: 20,
    },
  ],
  Twitter: [
    {
      title: 'River levels trending downward across the district',
      url: 'https://twitter.com/usace/status/river-levels-update',
      placement: 'Water management',
      notes: 'Thread with charts for stakeholders.',
      hoursAgo: 2,
    },
    {
      title: 'ICYMI: Public meeting recording now available',
      url: 'https://twitter.com/usace/status/public-meeting-recap',
      placement: 'Public affairs',
      notes: 'Links to the YouTube replay with transcript.',
      hoursAgo: 16,
    },
  ],
  Instagram: [
    {
      title: 'Highlight reel – levee inspection flyover',
      url: 'https://instagram.com/p/levee-inspection-reel',
      placement: 'Field operations',
      notes: 'Short-form reel showcasing the helicopter tour.',
      hoursAgo: 8,
    },
    {
      title: 'Water safety spotlight: life jacket fit tips',
      url: 'https://instagram.com/p/water-safety-spotlight',
      placement: 'Seasonal safety',
      notes: 'Carousel post with captions for each slide.',
      hoursAgo: 26,
    },
  ],
  LinkedIn: [
    {
      title: 'Hiring surge for coastal resilience engineers',
      url: 'https://linkedin.com/company/usace/posts/coastal-resilience-hiring',
      placement: 'Talent acquisition',
      notes: 'Mentions USAJobs listing and recruiting event.',
      hoursAgo: 6,
    },
    {
      title: 'Employee spotlight: innovation in lock maintenance',
      url: 'https://linkedin.com/company/usace/posts/employee-spotlight-lock-maintenance',
      placement: 'Internal recognition',
      notes: 'Features quotes from maintenance lead.',
      hoursAgo: 30,
    },
  ],
  YouTube: [
    {
      title: 'Debris removal mission overview',
      url: 'https://youtube.com/watch?v=usace-debris-removal',
      placement: 'Emergency operations',
      notes: '5-minute briefing with captions enabled.',
      hoursAgo: 12,
    },
    {
      title: 'Virtual tour: visitor center renovations',
      url: 'https://youtube.com/watch?v=usace-visitor-center-tour',
      placement: 'Visitor services',
      notes: 'Includes chapter markers for each gallery.',
      hoursAgo: 40,
    },
  ],
  Other: [
    {
      title: 'Podcast episode: Flood risk management insights',
      url: 'https://podcasts.example.com/usace/flood-risk-management',
      placement: 'Thought leadership',
      notes: 'Cross-posted to multiple podcast platforms.',
      hoursAgo: 18,
    },
  ],
};

const dynamicFeedFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const createDynamicFeedItem = (network: SocialNetwork): MockFeedItem => ({
  title: `${network} activity update (${dynamicFeedFormatter.format(new Date())})`,
  url: `https://social.example.com/${network.toLowerCase()}/${Date.now()}`,
  placement: 'Automated feed import',
  notes: 'Imported via API key.',
  hoursAgo: 0,
});

interface SprinklrConnectionState {
  connected: boolean;
  autoSync: 'Manual' | 'Daily' | 'Weekly';
  lastSynced?: string;
  clientId: string;
  clientSecret: string;
  environment: 'Production' | 'Sandbox';
  status: 'idle' | 'error' | 'success';
  message?: string;
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

const INITIAL_SPRINKLR_CONNECTION: SprinklrConnectionState = {
  connected: false,
  autoSync: 'Manual',
  clientId: '',
  clientSecret: '',
  environment: 'Production',
  status: 'idle',
};

const formatDate = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}).format(new Date(value));

const SocialMedia: React.FC<SocialMediaProps> = ({ role, campaigns }) => {
  const [entries, setEntries] = useState<SocialMediaEntry[]>([]);
  const [sprinklrConnection, setSprinklrConnection] = useState<SprinklrConnectionState>(INITIAL_SPRINKLR_CONNECTION);
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

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
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

  const importFeedEntries = (network: SocialNetwork, options?: { generateNew?: boolean }) => {
    const baseFeed = options?.generateNew ? [createDynamicFeedItem(network)] : MOCK_FEED_LIBRARY[network] ?? [];

    if (baseFeed.length === 0) {
      return 0;
    }

    let importedCount = 0;

    setEntries((prevEntries) => {
      const existingUrls = new Set(prevEntries.map((entry) => entry.url));
      const itemsToAdd = baseFeed
        .filter((item) => !existingUrls.has(item.url))
        .map((item, index) => ({
          id: Date.now() + index,
          network,
          title: item.title,
          url: item.url,
          placement: item.placement,
          notes: item.notes,
          createdAt: new Date(Date.now() - (item.hoursAgo ?? 0) * 60 * 60 * 1000).toISOString(),
        }));

      importedCount = itemsToAdd.length;

      if (itemsToAdd.length === 0) {
        return prevEntries;
      }

      return [...itemsToAdd, ...prevEntries];
    });

    return importedCount;
  };

  const importSprinklrFeed = (options?: { generateNew?: boolean }) => {
    return SOCIAL_NETWORKS.reduce(
      (count, network) => count + importFeedEntries(network, options),
      0,
    );
  };

  const updateSprinklrAutoSync = (value: SprinklrConnectionState['autoSync']) => {
    setSprinklrConnection((prev) => ({
      ...prev,
      autoSync: value,
    }));
  };

  const updateSprinklrCredential = (field: 'clientId' | 'clientSecret', value: string) => {
    setSprinklrConnection((prev) => ({
      ...prev,
      [field]: value,
      status: 'idle',
      message: undefined,
    }));
  };

  const updateSprinklrEnvironment = (value: SprinklrConnectionState['environment']) => {
    setSprinklrConnection((prev) => ({
      ...prev,
      environment: value,
    }));
  };

  const toggleSprinklrConnection = () => {
    setSprinklrConnection((prev) => {
      if (!prev.connected) {
        if (!prev.clientId.trim() || !prev.clientSecret.trim()) {
          return {
            ...prev,
            status: 'error',
            message: 'Provide both the Sprinklr client ID and client secret to connect.',
          };
        }

        const importedCount = importSprinklrFeed();
        const timestamp = new Date().toISOString();

        return {
          ...prev,
          connected: true,
          lastSynced: timestamp,
          status: 'success',
          message:
            importedCount > 0
              ? `Connected to Sprinklr successfully. Imported ${importedCount} ${importedCount === 1 ? 'post' : 'posts'}.`
              : 'Connected to Sprinklr successfully. No new posts available.',
        };
      }

      return {
        ...prev,
        connected: false,
        lastSynced: undefined,
        status: 'idle',
        message: undefined,
      };
    });
  };

  const handleSprinklrManualSync = () => {
    setSprinklrConnection((prev) => {
      if (!prev.connected) {
        return {
          ...prev,
          status: 'error',
          message: 'Connect to Sprinklr before syncing.',
        };
      }

      const importedCount = importSprinklrFeed({ generateNew: true });
      const timestamp = new Date().toISOString();

      return {
        ...prev,
        lastSynced: timestamp,
        status: 'success',
        message:
          importedCount > 0
            ? `Synced ${importedCount} new ${importedCount === 1 ? 'post' : 'posts'} from Sprinklr.`
            : 'Sync complete. No new posts found.',
      };
    });
  };

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-card dark:shadow-card-dark">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-4">Social Content Library</h2>
        <p className="text-gray-600 dark:text-navy-300 mb-6">
      <section className="glass-panel space-y-6">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-usace-blue/70 dark:text-navy-200/80">Library</span>
          <h2 className="text-2xl font-semibold text-navy-900 dark:text-white">Social content library</h2>
        </div>
        <p className="text-sm text-navy-600 dark:text-navy-200">
          Capture the links and placements for the social media content you create across platforms. These entries are private to
          your team and make it easier to reference successful posts later.
        </p>

        <form onSubmit={handleAddEntry} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-navy-800 dark:text-navy-100">
              Social network
              <select
                name="network"
                value={formState.network}
                onChange={handleFormChange}
                className="input-modern"
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
                className="input-modern"
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
                placeholder="https://"
                className="input-modern"
                required
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-navy-800 dark:text-navy-100">
              Placement or campaign tie-in
              <input
                type="text"
                name="placement"
                value={formState.placement}
                onChange={handleFormChange}
                placeholder="Great Lakes Water Safety"
                className="input-modern"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-navy-800 dark:text-navy-100">
              Campaign
              <select
                name="campaignId"
                value={formState.campaignId}
                onChange={handleFormChange}
                className="input-modern"
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
              placeholder="Key talking points, imagery cues, or results."
              className="textarea-modern h-32"
            />
          </label>

          <div className="flex justify-end">
            <button type="submit" className="surface-button">
              Add social link
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-card dark:shadow-card-dark">
        <div className="flex items-center justify-between mb-4">
      <section className="glass-panel space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-navy-900 dark:text-white">Saved links & placements</h3>
          <span className="text-sm text-navy-600 dark:text-navy-200">{entries.length} item{entries.length === 1 ? '' : 's'}</span>
        </div>

        {hasEntries ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/40 dark:divide-white/10">
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
              <tbody className="divide-y divide-white/30 dark:divide-white/10">
                {sortedEntries.map((entry) => (
                  <tr key={entry.id} className="transition hover:bg-usace-blue/10 dark:hover:bg-white/10">
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

      <section className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-card dark:shadow-card-dark">
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
            <div className="rounded-lg border border-gray-200 bg-navy-50/50 p-4 dark:border-navy-700 dark:bg-navy-900/40">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-navy-900 dark:text-white">Sprinklr API</h4>
                  <p className="text-sm text-gray-600 dark:text-navy-300">
                    Link your Sprinklr workspace to mirror the approved social content and metrics in one place.
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    sprinklrConnection.connected
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                      : 'bg-gray-200 text-gray-700 dark:bg-navy-800 dark:text-navy-200'
                  }`}
                >
                  {sprinklrConnection.connected ? 'Connected' : 'Offline'}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-navy-300">
                  Auto-sync frequency
                  <select
                    value={sprinklrConnection.autoSync}
                    onChange={(event) => updateSprinklrAutoSync(event.target.value as SprinklrConnectionState['autoSync'])}
                    className="input-modern"
                  >
                    <option value="Manual">Manual import</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </label>

                <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-navy-300">
                  Sprinklr environment
                  <select
                    value={sprinklrConnection.environment}
                    onChange={(event) => updateSprinklrEnvironment(event.target.value as SprinklrConnectionState['environment'])}
                    className="input-modern"
                  >
                    <option value="Production">Production</option>
                    <option value="Sandbox">Sandbox</option>
                  </select>
                </label>

                <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-navy-300">
                  Client ID
                  <input
                    type="text"
                    value={sprinklrConnection.clientId}
                    onChange={(event) => updateSprinklrCredential('clientId', event.target.value)}
                    placeholder="Enter client ID"
                    className="input-modern"
                  />
                </label>

                <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-navy-300">
                  Client secret
                  <input
                    type="password"
                    value={sprinklrConnection.clientSecret}
                    onChange={(event) => updateSprinklrCredential('clientSecret', event.target.value)}
                    placeholder="Enter client secret"
                    className="input-modern"
                  />
                  <span className="mt-1 text-[11px] font-normal normal-case text-gray-500 dark:text-navy-300">
                    Stored locally to simulate OAuth credential storage for this demo environment.
                  </span>
                </label>

                {sprinklrConnection.message && (
                  <div
                    className={`rounded-md border px-3 py-2 text-xs font-semibold ${
                      sprinklrConnection.status === 'error'
                        ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-950/40 dark:text-red-200'
                        : 'border-green-200 bg-green-50 text-green-700 dark:border-green-800/40 dark:bg-green-950/40 dark:text-green-200'
                    }`}
                  >
                    {sprinklrConnection.message}
                  </div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={toggleSprinklrConnection}
                    className={`surface-button secondary ${sprinklrConnection.connected ? 'text-usace-red ring-usace-red/50 hover:bg-usace-red/10' : ''}`}
                  >
                    {sprinklrConnection.connected ? 'Disconnect Sprinklr' : 'Connect Sprinklr'}
                  </button>

                  <button
                    type="button"
                    disabled={!sprinklrConnection.connected}
                    onClick={handleSprinklrManualSync}
                    className={`surface-button secondary ${sprinklrConnection.connected ? '' : 'cursor-not-allowed opacity-50'}`}
                  >
                    Sync now
                  </button>
                </div>

                {sprinklrConnection.connected && sprinklrConnection.lastSynced && (
                  <p className="text-xs text-navy-600 dark:text-navy-200">
                    Last synced {formatDate(sprinklrConnection.lastSynced)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-white/40 p-6 text-center backdrop-blur dark:border-white/10">
            <h4 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">Chief tools required</h4>
            <p className="text-sm text-navy-600 dark:text-navy-200">
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
