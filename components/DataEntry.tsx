import React, { useState, useMemo, useEffect } from 'react';
import { KpiDataPoint, EntryType, Campaign } from '../types';
import { ENTRY_TYPES, METRIC_OPTIONS } from '../constants';
import { useNotification } from '../contexts/NotificationProvider';

interface DataEntryProps {
  onSubmit: (dataPoint: Omit<KpiDataPoint, 'id'>) => void;
  campaigns: Campaign[];
}

const DataEntry: React.FC<DataEntryProps> = ({ onSubmit, campaigns }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<EntryType>(EntryType.OUTPUT);
  const [metric, setMetric] = useState('');
  const [customMetric, setCustomMetric] = useState('');
  const [quantity, setQuantity] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const { showToast } = useNotification();

  const availableMetrics = useMemo(() => METRIC_OPTIONS[type] || [], [type]);

  useEffect(() => {
    if (availableMetrics.length > 0) {
      setMetric(availableMetrics[0]);
    } else {
      setMetric('');
    }
  }, [availableMetrics]);

  const activeCampaigns = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return campaigns.filter((campaign) => campaign.end_date >= today);
  }, [campaigns]);

  const handleMetricChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMetric = event.target.value;
    setMetric(newMetric);
    if (newMetric !== 'Other') {
      setCustomMetric('');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const finalMetric = metric === 'Other' ? customMetric : metric;

    if (!date || !type || !finalMetric || !quantity) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    onSubmit({
      date,
      type,
      metric: finalMetric,
      quantity: parseFloat(quantity),
      notes,
      campaign_id: campaignId ? parseInt(campaignId, 10) : undefined,
      link: link || undefined,
    });

    setType(EntryType.OUTPUT);
    setMetric(METRIC_OPTIONS[EntryType.OUTPUT][0]);
    setCustomMetric('');
    setQuantity('');
    setLink('');
    setNotes('');
    setCampaignId('');
  };

  return (
    <div className="glass-panel max-w-3xl space-y-6 md:p-10">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-usace-blue/70 dark:text-navy-200/80">Data capture</span>
        <h2 className="mt-2 text-3xl font-semibold text-navy-900 dark:text-white">Add new KPI entry</h2>
        <p className="mt-3 text-sm text-navy-600 dark:text-navy-200">
          Log performance activity with richer context to keep leadership aligned across campaigns.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
            Date
            <input type="date" id="date" value={date} onChange={(event) => setDate(event.target.value)} required className="input-modern" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
            Type
            <select id="type" value={type} onChange={(event) => setType(event.target.value as EntryType)} required className="input-modern">
              {ENTRY_TYPES.map((entryType) => (
                <option key={entryType} value={entryType}>
                  {entryType}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
            Metric
            <select id="metric" value={metric} onChange={handleMetricChange} required className="input-modern">
              {availableMetrics.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
            Quantity
            <input
              type="number"
              step="any"
              id="quantity"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
              placeholder="e.g., 152"
              className="input-modern"
            />
          </label>
        </div>

        {metric === 'Other' && (
          <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
            Custom metric
            <input
              type="text"
              id="custom-metric"
              value={customMetric}
              onChange={(event) => setCustomMetric(event.target.value)}
              required
              placeholder="Specify your metric"
              className="input-modern"
            />
          </label>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
            Campaign (optional)
            <select id="campaign" value={campaignId} onChange={(event) => setCampaignId(event.target.value)} className="input-modern">
              <option value="">None</option>
              {activeCampaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
            Link (optional)
            <input
              type="url"
              id="link"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://example.com"
              className="input-modern"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
          Notes (optional)
          <textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="textarea-modern" />
        </label>

        <div className="flex justify-end">
          <button type="submit" className="surface-button">
            Save entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataEntry;
