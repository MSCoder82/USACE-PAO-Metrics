import React, { useMemo, useState } from 'react';
import { Campaign, Role } from '../types';

const SOCIAL_NETWORKS = ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube', 'Other'] as const;

type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

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

const formatRelativeTime = (isoDate: string) => {
  const now = new Date();
  const past = new Date(isoDate);
  const diffMs = now.getTime() - past.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.round(diffHours / 24);
  return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
};

const createInitialEntries = (): SocialMediaEntry[] => {
  let idCounter = 1;
  return SOCIAL_NETWORKS.flatMap((network) =>
    (MOCK_FEED_LIBRARY[network] ?? []).slice(0, 1).map((item) => ({
      id: idCounter++,
      network,
      title: item.title,
      url: item.url,
      placement: item.placement,
      notes: item.notes,
      createdAt: new Date(Date.now() - item.hoursAgo * 60 * 60 * 1000).toISOString(),
    }))
  );
};

interface SocialMediaProps {
  role: Role;
  campaigns: Campaign[];
}

const SocialMedia: React.FC<SocialMediaProps> = ({ role, campaigns }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<SocialNetwork | 'all'>('all');
  const [entries, setEntries] = useState<SocialMediaEntry[]>(createInitialEntries());
  const [network, setNetwork] = useState<SocialNetwork>('Facebook');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [placement, setPlacement] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [notes, setNotes] = useState('');

  const canManage = role === 'chief';

  const filteredEntries = useMemo(() => {
    if (selectedNetwork === 'all') {
      return entries;
    }
    return entries.filter((entry) => entry.network === selectedNetwork);
  }, [entries, selectedNetwork]);

  const feedSuggestions = useMemo(() => {
    if (selectedNetwork === 'all') {
      return SOCIAL_NETWORKS.flatMap((networkName) =>
        (MOCK_FEED_LIBRARY[networkName] ?? []).map((item) => ({ ...item, network: networkName }))
      ).slice(0, 3);
    }

    return (MOCK_FEED_LIBRARY[selectedNetwork] ?? []).map((item) => ({ ...item, network: selectedNetwork }));
  }, [selectedNetwork]);

  const campaignSummaries = useMemo(() => {
    const counts = new Map<number, number>();
    entries.forEach((entry) => {
      if (entry.campaignId) {
        counts.set(entry.campaignId, (counts.get(entry.campaignId) ?? 0) + 1);
      }
    });
    return campaigns
      .filter((campaign) => counts.has(campaign.id))
      .map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        count: counts.get(campaign.id) ?? 0,
      }));
  }, [entries, campaigns]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !url || !placement) {
      return;
    }

    setEntries((prev) => [
      {
        id: prev.length ? prev[0].id + 1 : 1,
        network,
        title,
        url,
        placement,
        campaignId: campaignId ? Number(campaignId) : undefined,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setTitle('');
    setUrl('');
    setPlacement('');
    setCampaignId('');
    setNotes('');
  };

  return (
    <section className="space-y-8">
      <div className="glass-panel space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-usace-blue/70 dark:text-navy-200/80">
              Social command center
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-navy-900 dark:text-white">Mission-wide social coverage</h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="network-filter" className="text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200">
              Filter network
            </label>
            <select
              id="network-filter"
              value={selectedNetwork}
              onChange={(event) =>
                setSelectedNetwork(event.target.value === 'all' ? 'all' : (event.target.value as SocialNetwork))
              }
              className="input-modern"
            >
              <option value="all">All networks</option>
              {SOCIAL_NETWORKS.map((networkName) => (
                <option key={networkName} value={networkName}>
                  {networkName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Recent coverage</h3>
            <ul className="space-y-4">
              {filteredEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-white/30 bg-white/50 p-4 transition hover:border-usace-blue/40 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="soft-badge">{entry.network}</span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-usace-blue/80 dark:text-navy-200/80">
                        {formatRelativeTime(entry.createdAt)}
                      </span>
                    </div>
                    <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-usace-blue hover:text-usace-red">
                      {entry.title}
                    </a>
                    <p className="text-sm text-navy-600 dark:text-navy-200">{entry.placement}</p>
                    {entry.notes && (
                      <p className="text-sm text-navy-500 dark:text-navy-300">{entry.notes}</p>
                    )}
                    {entry.campaignId && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200">
                        Campaign: {campaigns.find((campaign) => campaign.id === entry.campaignId)?.name ?? 'Unknown'}
                      </span>
                    )}
                  </div>
                </li>
              ))}
              {filteredEntries.length === 0 && (
                <li className="rounded-2xl border border-dashed border-white/40 bg-white/40 p-6 text-center text-sm text-navy-600 dark:border-white/10 dark:bg-white/5 dark:text-navy-200">
                  No coverage logged for this network yet.
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-6">
            {canManage && (
              <div className="rounded-2xl border border-white/30 bg-white/50 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Log a new post</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
                      Network
                      <select
                        value={network}
                        onChange={(event) => setNetwork(event.target.value as SocialNetwork)}
                        className="input-modern"
                      >
                        {SOCIAL_NETWORKS.map((networkName) => (
                          <option key={networkName} value={networkName}>
                            {networkName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
                      Campaign (optional)
                      <select
                        value={campaignId}
                        onChange={(event) => setCampaignId(event.target.value)}
                        className="input-modern"
                      >
                        <option value="">None</option>
                        {campaigns.map((campaign) => (
                          <option key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
                    Title
                    <input
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      required
                      className="input-modern"
                      placeholder="Post headline"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
                    URL
                    <input
                      type="url"
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      required
                      className="input-modern"
                      placeholder="https://"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
                    Placement
                    <input
                      type="text"
                      value={placement}
                      onChange={(event) => setPlacement(event.target.value)}
                      required
                      className="input-modern"
                      placeholder="Channel or content focus"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
                    Notes (optional)
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={3}
                      className="textarea-modern"
                      placeholder="Key takeaways or performance notes"
                    />
                  </label>
                  <div className="flex justify-end">
                    <button type="submit" className="surface-button">
                      Save activity
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4 rounded-2xl border border-white/30 bg-white/50 p-5 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Suggested stories</h3>
              <ul className="space-y-3">
                {feedSuggestions.map((item, index) => (
                  <li key={`${item.title}-${index}`} className="rounded-xl border border-white/20 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="soft-badge">{item.network}</span>
                      <span className="text-xs text-navy-500 dark:text-navy-200">{item.hoursAgo}h ago</span>
                    </div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm font-semibold text-usace-blue hover:text-usace-red">
                      {item.title}
                    </a>
                    <p className="text-sm text-navy-600 dark:text-navy-200">{item.placement}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-300">{item.notes}</p>
                  </li>
                ))}
              </ul>
            </div>

            {campaignSummaries.length > 0 && (
              <div className="rounded-2xl border border-white/30 bg-white/50 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Campaign coverage</h3>
                <ul className="mt-3 space-y-2 text-sm text-navy-600 dark:text-navy-200">
                  {campaignSummaries.map((summary) => (
                    <li key={summary.id} className="flex items-center justify-between rounded-xl bg-white/60 p-3 dark:bg-white/10">
                      <span>{summary.name}</span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-usace-blue/80 dark:text-navy-200/80">
                        {summary.count} posts
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialMedia;
