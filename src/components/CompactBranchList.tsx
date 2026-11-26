import React, { useMemo, useState } from 'react';
import { Branch, BranchId } from '../types';
import { Check, ChevronRight, Search, X } from 'lucide-react';

interface CompactBranchListProps {
  branches: Branch[];
  selectedBranchId?: BranchId | null;
  lastUsedBranchId?: BranchId | null;
  isLoading?: boolean;
  onSelectBranch: (branchId: BranchId) => void;
  maxListHeightClass?: string;
}

interface BranchLocationInfo {
  areaLine: string;
  city: string | null;
}

function getBranchLocation(branch: Branch): BranchLocationInfo {
  const extended = branch as Branch & { city?: string; area?: string };
  if (extended.city) {
    const areaLine = extended.area ? `${extended.area}, ${extended.city}` : extended.city;
    return { areaLine, city: extended.city };
  }

  const parts = (branch.address || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { areaLine: branch.name, city: null };
  }

  // Strip trailing state/pincode segment (e.g. "Telangana 500062")
  const cleaned = [...parts];
  const last = cleaned[cleaned.length - 1];
  if (cleaned.length >= 2 && /\b\d{6}\b/.test(last)) {
    cleaned.pop();
  }

  if (cleaned.length >= 2) {
    const city = cleaned[cleaned.length - 1];
    const area = cleaned[cleaned.length - 2];
    return { areaLine: `${area}, ${city}`, city };
  }

  return { areaLine: cleaned[0] || branch.address, city: null };
}

export const CompactBranchList: React.FC<CompactBranchListProps> = ({
  branches,
  selectedBranchId = null,
  lastUsedBranchId = null,
  isLoading = false,
  onSelectBranch,
  maxListHeightClass = 'max-h-[56vh]',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const branchesWithLocation = useMemo(() => {
    return branches.map((branch) => ({
      branch,
      ...getBranchLocation(branch),
    }));
  }, [branches]);

  const filteredItems = useMemo(() => {
    const base = trimmedQuery
      ? branchesWithLocation.filter(({ branch, areaLine, city }) => {
          return (
            branch.shortName.toLowerCase().includes(trimmedQuery) ||
            branch.name.toLowerCase().includes(trimmedQuery) ||
            areaLine.toLowerCase().includes(trimmedQuery) ||
            (city && city.toLowerCase().includes(trimmedQuery)) ||
            branch.address.toLowerCase().includes(trimmedQuery)
          );
        })
      : branchesWithLocation;

    return [...base].sort((a, b) =>
      a.branch.shortName.localeCompare(b.branch.shortName, undefined, { sensitivity: 'base' })
    );
  }, [branchesWithLocation, trimmedQuery]);

  const lastUsedItem = useMemo(() => {
    if (trimmedQuery || !lastUsedBranchId) return null;
    return branchesWithLocation.find((item) => item.branch.id === lastUsedBranchId) || null;
  }, [branchesWithLocation, lastUsedBranchId, trimmedQuery]);

  const hasCityData = useMemo(() => {
    return filteredItems.some((item) => Boolean(item.city));
  }, [filteredItems]);

  const cityGroups = useMemo(() => {
    if (!hasCityData) return null;

    const groups = new Map<string, typeof filteredItems>();
    for (const item of filteredItems) {
      const key = item.city || 'Other';
      const existing = groups.get(key);
      if (existing) {
        existing.push(item);
      } else {
        groups.set(key, [item]);
      }
    }

    return Array.from(groups.entries()).sort(([cityA], [cityB]) =>
      cityA.localeCompare(cityB, undefined, { sensitivity: 'base' })
    );
  }, [filteredItems, hasCityData]);

  const renderRow = (branch: Branch, areaLine: string) => {
    const isSelected = selectedBranchId === branch.id;

    return (
      <button
        key={branch.id}
        type="button"
        onClick={() => onSelectBranch(branch.id)}
        className={`w-full min-h-[52px] px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors ${
          isSelected
            ? 'bg-bode-gold/10 hover:bg-bode-gold/15'
            : 'bg-white hover:bg-bode-ivory/70 active:bg-bode-ivory'
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-bode-forest truncate leading-snug">
            {branch.shortName}
          </p>
          <p className="text-xs text-bode-muted truncate mt-0.5 leading-snug">
            {areaLine}
          </p>
        </div>

        <span className="shrink-0 flex items-center justify-center">
          {isSelected ? (
            <span className="w-6 h-6 rounded-full bg-bode-forest text-white flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </span>
          ) : (
            <ChevronRight className="w-4 h-4 text-bode-muted" />
          )}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-bode-border bg-white">
        <div className="relative">
          <Search className="w-4 h-4 text-bode-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search branch or area..."
            aria-label="Search branch or area"
            className="w-full pl-9 pr-9 py-2.5 bg-bode-ivory/50 border border-bode-border rounded-lg text-sm text-bode-charcoal placeholder-bode-muted focus:outline-none focus:ring-2 focus:ring-bode-forest focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear branch search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-bode-muted hover:text-bode-charcoal rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable List Body */}
      <div className={`overflow-y-auto bg-white ${maxListHeightClass}`}>
        {isLoading ? (
          <div className="divide-y divide-bode-border/60" aria-label="Loading branches">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="min-h-[52px] px-4 py-3 flex items-center justify-between gap-3 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 bg-bode-ivoryDark rounded" />
                  <div className="h-3 w-1/3 bg-bode-ivory rounded" />
                </div>
                <div className="w-4 h-4 bg-bode-ivoryDark rounded" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-bode-charcoal">No branches found</p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-medium text-bode-emerald hover:text-bode-forest transition"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Last Used Section */}
            {lastUsedItem && (
              <div className="border-b border-bode-border">
                <div className="px-4 py-1.5 bg-bode-ivory/80 border-b border-bode-border/60">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-bode-emerald">
                    Last used
                  </span>
                </div>
                {renderRow(lastUsedItem.branch, lastUsedItem.areaLine)}
              </div>
            )}

            {/* City-Grouped or Flat Alphabetical List */}
            {cityGroups ? (
              <div>
                {cityGroups.map(([city, items]) => (
                  <div key={city}>
                    <div className="sticky top-0 z-10 px-4 py-1.5 bg-bode-ivory/95 backdrop-blur-sm border-b border-bode-border/70">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-bode-muted">
                        {city}
                      </span>
                    </div>
                    <div className="divide-y divide-bode-border/60">
                      {items.map(({ branch, areaLine }) => renderRow(branch, areaLine))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-bode-border/60">
                {filteredItems.map(({ branch, areaLine }) => renderRow(branch, areaLine))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
