import React, { useState } from 'react';

const STATUS_OPTIONS = [
  { key: 'errors', label: 'Errors' },
  { key: 'inProgress', label: 'In Progress' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'stuck', label: 'Stuck >1hr' },
];
const CHANNEL_OPTIONS = [
  { key: 'Fax', label: 'Fax' },
  { key: 'eSMD', label: 'esMD' },
  { key: 'Provider Portal', label: 'Portal' },
];
const DATE_OPTIONS = [
  { key: 'today', label: 'Today' },
  { key: '24hrs', label: 'Last 24hrs' },
  { key: '7days', label: 'Last 7 days' },
  { key: 'custom', label: 'Custom' },
];

// Map quick filter keys to labels
const QUICK_FILTER_LABELS = {
  critical: 'Critical Errors',
  manual: 'Pending Manual Review',
  processing: 'Processing Now',
  completed: 'Completed Today',
};

function FilterBar({ filters, setFilters, resultCount, totalCount, onSearch, onClear, onAdvanced, quickFilter, onClearQuickFilter }) {
  const [search, setSearch] = useState(filters.search || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Make errors, inProgress, delivered mutually exclusive
  const handleStatusToggle = (key) => {
    if (["errors", "inProgress", "delivered"].includes(key)) {
      setFilters({ ...filters, status: filters.status.includes(key) ? [] : [key] });
    } else {
      setFilters({ ...filters, status: filters.status.includes(key) ? filters.status.filter(s => s !== key) : [...filters.status, key] });
    }
  };
  const handleChannelToggle = (key) => {
    setFilters({ ...filters, channel: filters.channel.includes(key) ? filters.channel.filter(c => c !== key) : [...filters.channel, key] });
  };
  const handleDateChange = (key) => {
    setFilters({ ...filters, date: key });
  };
  const handleSearch = (e) => {
    setSearch(e.target.value);
    onSearch(e.target.value);
  };

  const handleClearAll = () => {
    setSearch('');
    onClear();
    if (onClearQuickFilter) {
      onClearQuickFilter();
    }
  };

  const activeCount = [search, ...filters.status, ...filters.channel, filters.date !== 'today' ? filters.date : null].filter(Boolean).length;
  const hasQuickFilter = !!quickFilter;
  const totalActiveFilters = activeCount + (hasQuickFilter ? 1 : 0);

  return (
    <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 20px', margin: '18px 0 12px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
      {/* Active Filters Chips Row */}
      {(hasQuickFilter || activeCount > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #e0e0e0' }}>
          <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>Active Filters:</span>

          {/* Quick Filter Chip */}
          {hasQuickFilter && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#007bff',
              color: 'white',
              borderRadius: 16,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 500,
            }}>
              {QUICK_FILTER_LABELS[quickFilter] || quickFilter}
              <button
                onClick={onClearQuickFilter}
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: 0,
                }}
                title="Remove filter"
              >
                ×
              </button>
            </span>
          )}

          {/* Search Chip */}
          {search && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#6c757d',
              color: 'white',
              borderRadius: 16,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 500,
            }}>
              Search: "{search}"
              <button
                onClick={() => { setSearch(''); onSearch(''); }}
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: 0,
                }}
                title="Remove filter"
              >
                ×
              </button>
            </span>
          )}

          {/* Status Filter Chips */}
          {filters.status.map(status => (
            <span key={status} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#28a745',
              color: 'white',
              borderRadius: 16,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 500,
            }}>
              {STATUS_OPTIONS.find(s => s.key === status)?.label || status}
              <button
                onClick={() => handleStatusToggle(status)}
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: 0,
                }}
                title="Remove filter"
              >
                ×
              </button>
            </span>
          ))}

          {/* Channel Filter Chips */}
          {filters.channel.map(channel => (
            <span key={channel} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fd7e14',
              color: 'white',
              borderRadius: 16,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 500,
            }}>
              {CHANNEL_OPTIONS.find(c => c.key === channel)?.label || channel}
              <button
                onClick={() => handleChannelToggle(channel)}
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: 0,
                }}
                title="Remove filter"
              >
                ×
              </button>
            </span>
          ))}

          {/* Date Filter Chip (if not default) */}
          {filters.date !== 'today' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#17a2b8',
              color: 'white',
              borderRadius: 16,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 500,
            }}>
              {DATE_OPTIONS.find(d => d.key === filters.date)?.label || filters.date}
              <button
                onClick={() => handleDateChange('today')}
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: 0,
                }}
                title="Remove filter"
              >
                ×
              </button>
            </span>
          )}

          {/* Clear All Button */}
          <button
            onClick={handleClearAll}
            style={{
              marginLeft: 'auto',
              borderRadius: 16,
              border: '1px solid #dc3545',
              background: '#fff',
              color: '#dc3545',
              fontSize: 12,
              fontWeight: 500,
              padding: '4px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>×</span> Clear All ({totalActiveFilters})
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 10 }}>
        {/* Quick search */}
        <input
          type="text"
          placeholder="Search by Packet ID, Provider, Patient..."
          value={search}
          onChange={handleSearch}
          style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 14, minWidth: 220 }}
        />
        {/* Status pills */}
        <div style={{ display: 'flex', gap: 8 }}>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => handleStatusToggle(opt.key)}
              style={{
                borderRadius: 20,
                border: '1px solid',
                borderColor: filters.status.includes(opt.key) ? '#007bff' : '#ccc',
                background: filters.status.includes(opt.key) ? '#e3f0ff' : '#fff',
                color: filters.status.includes(opt.key) ? '#007bff' : '#444',
                fontWeight: 500,
                padding: '6px 16px',
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: filters.status.includes(opt.key) ? '0 0 4px #007bff33' : 'none',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Channel selector */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#888', marginRight: 4 }}>Channel:</span>
          {CHANNEL_OPTIONS.map(opt => (
            <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type="checkbox"
                checked={filters.channel.includes(opt.key)}
                onChange={() => handleChannelToggle(opt.key)}
                style={{ accentColor: '#007bff', marginRight: 2 }}
              />
              <span style={{ fontSize: 13 }}>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        {/* Date range picker */}
        <select
          value={filters.date}
          onChange={e => handleDateChange(e.target.value)}
          style={{ borderRadius: 20, padding: '6px 14px', fontSize: 13, border: '1px solid #ccc', background: '#fff', color: '#444' }}
        >
          {DATE_OPTIONS.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
        {/* Advanced filters */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ border: 'none', background: 'none', color: '#007bff', textDecoration: 'underline', fontSize: 13, cursor: 'pointer', marginLeft: 8 }}
        >
          Advanced filters
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#888' }}>
          Showing {resultCount} of {totalCount} packets
        </span>
        {/* Advanced dropdown stub */}
        {showAdvanced && (
          <div style={{ position: 'absolute', top: 48, left: 0, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 16, zIndex: 10 }}>
            <div style={{ marginBottom: 8 }}>
              <label>MAC:</label>
              <input type="text" style={{ marginLeft: 8 }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Service Type:</label>
              <input type="text" style={{ marginLeft: 8 }} />
            </div>
            <div>
              <label>Error Code:</label>
              <input type="text" style={{ marginLeft: 8 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
