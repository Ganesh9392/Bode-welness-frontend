import React, { useState } from 'react';
import {
  Copy,
  Edit3,
  ExternalLink,
  Plus,
  Trash2,
  X,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  BackofficeHomepageConfig,
  BackofficePromoBanner,
  BackofficeTrendingItem,
} from '../../types/backoffice';
import { genId } from '../../services/backofficeService';
import {
  BackofficeBottomBar,
  BackofficeCard,
  BackofficeConfirmDialog,
  BackofficeField,
  BackofficeImageBox,
  BackofficeSubHeader,
  BackofficeToggle,
  boInputCls,
} from './BackofficeSharedUI';

interface HomepageViewProps {
  config: BackofficeHomepageConfig;
  onUpdate: (next: BackofficeHomepageConfig, toastMsg: string) => void;
  onBack: () => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

// Crisp deterministic SVG QR matrix based on URL string
const StoreQrCodeSvg: React.FC<{ url: string }> = ({ url }) => {
  const size = 21;
  const cells: boolean[] = [];
  let hash = 2166136261;
  for (let i = 0; i < url.length; i++) {
    hash ^= url.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const isFinder = (r: number, c: number) => {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= size - 7;
    const inBottomLeft = r >= size - 7 && c < 7;
    if (!inTopLeft && !inTopRight && !inBottomLeft) return null;
    const lr = r >= size - 7 ? r - (size - 7) : r;
    const lc = c >= size - 7 ? c - (size - 7) : c;
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
    if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
    return false;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const f = isFinder(r, c);
      if (f !== null) {
        cells.push(f);
      } else if ((r === 7 && (c < 8 || c >= size - 8)) || (c === 7 && (r < 8 || r >= size - 8))) {
        cells.push(false);
      } else {
        const seed = (hash ^ (r * 31 + c * 17)) >>> 0;
        cells.push((seed % 11) < 5);
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-44 h-44 mx-auto text-bode-charcoal"
      role="img"
      aria-label="Store website QR code"
    >
      <rect width={size} height={size} fill="white" />
      {cells.map((filled, idx) => {
        if (!filled) return null;
        const r = Math.floor(idx / size);
        const c = idx % size;
        return <rect key={idx} x={c} y={r} width={1} height={1} fill="currentColor" />;
      })}
    </svg>
  );
};

export const HomepageView: React.FC<HomepageViewProps> = ({
  config,
  onUpdate,
  onBack,
  onNotify,
}) => {
  const [editingBanner, setEditingBanner] = useState<BackofficePromoBanner | null>(null);
  const [isNewBanner, setIsNewBanner] = useState(false);

  const [editingTrendingList, setEditingTrendingList] = useState(false);
  const [editingTrendItem, setEditingTrendItem] = useState<BackofficeTrendingItem | null>(null);
  const [isNewTrend, setIsNewTrend] = useState(false);

  const [createChooserOpen, setCreateChooserOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: 'banner'; id: string; title: string }
    | { kind: 'trending'; id: string; title: string }
    | null
  >(null);
  const [copied, setCopied] = useState(false);

  const [bannerError, setBannerError] = useState('');
  const [trendError, setTrendError] = useState('');

  const openNewBanner = () => {
    setCreateChooserOpen(false);
    setIsNewBanner(true);
    setBannerError('');
    setEditingBanner({
      id: '',
      title: '',
      subtitle: '',
      imageUrl: '',
      isActive: true,
      showOnCatalogue: true,
    });
  };

  const openEditBanner = (b: BackofficePromoBanner) => {
    setIsNewBanner(false);
    setBannerError('');
    setEditingBanner({ ...b });
  };

  const handleSaveBanner = () => {
    if (!editingBanner) return;
    if (!editingBanner.title.trim()) {
      setBannerError('Banner title is required.');
      return;
    }
    const finalBanner: BackofficePromoBanner = {
      ...editingBanner,
      id: isNewBanner ? genId('ban') : editingBanner.id,
      title: editingBanner.title.trim(),
      subtitle: editingBanner.subtitle.trim(),
      imageUrl:
        editingBanner.imageUrl ||
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80',
    };
    const nextBanners = isNewBanner
      ? [finalBanner, ...config.banners]
      : config.banners.map((b) => (b.id === finalBanner.id ? finalBanner : b));
    onUpdate(
      { ...config, banners: nextBanners },
      isNewBanner ? 'Promo banner created' : 'Promo banner updated'
    );
    setEditingBanner(null);
  };

  const openNewTrending = () => {
    setCreateChooserOpen(false);
    setIsNewTrend(true);
    setTrendError('');
    setEditingTrendItem({
      id: '',
      title: '',
      imageUrl: '',
      linkedServiceName: '',
      isActive: true,
    });
  };

  const openEditTrending = (item: BackofficeTrendingItem) => {
    setIsNewTrend(false);
    setTrendError('');
    setEditingTrendItem({ ...item });
  };

  const handleSaveTrending = () => {
    if (!editingTrendItem) return;
    if (!editingTrendItem.title.trim()) {
      setTrendError('Trending item title is required.');
      return;
    }
    const finalItem: BackofficeTrendingItem = {
      ...editingTrendItem,
      id: isNewTrend ? genId('trd') : editingTrendItem.id,
      title: editingTrendItem.title.trim(),
      imageUrl:
        editingTrendItem.imageUrl ||
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    };
    const nextTrending = isNewTrend
      ? [...config.trending, finalItem]
      : config.trending.map((t) => (t.id === finalItem.id ? finalItem : t));
    onUpdate(
      { ...config, trending: nextTrending },
      isNewTrend ? 'Trending item added' : 'Trending item updated'
    );
    setEditingTrendItem(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'banner') {
      onUpdate(
        { ...config, banners: config.banners.filter((b) => b.id !== deleteTarget.id) },
        'Promo banner removed'
      );
      setEditingBanner(null);
    } else {
      onUpdate(
        { ...config, trending: config.trending.filter((t) => t.id !== deleteTarget.id) },
        'Trending item removed'
      );
      setEditingTrendItem(null);
    }
    setDeleteTarget(null);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(config.storeWebsiteUrl);
      setCopied(true);
      onNotify('success', 'Store URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify('info', config.storeWebsiteUrl);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader title="Homepage" onBack={onBack} />

      <div className="max-w-3xl mx-auto space-y-4">
        {/* Promo Banner Card(s) */}
        {config.banners.length === 0 ? (
          <BackofficeCard className="text-center py-8 space-y-2">
            <p className="text-sm font-serif font-semibold text-bode-forest">No promo banners yet</p>
            <p className="text-xs text-bode-muted">Tap Create New to add a promotional banner.</p>
          </BackofficeCard>
        ) : (
          config.banners.map((banner) => (
            <BackofficeCard key={banner.id} className="p-3 sm:p-4 space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-bode-border bg-bode-ivory/40">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-52 sm:h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bode-forestDark/85 via-bode-forestDark/25 to-transparent flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-bode-gold text-bode-forest font-bold uppercase tracking-wider">
                      {banner.isActive ? 'Live Offer' : 'Inactive'}
                    </span>
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold leading-snug">
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className="text-xs text-white/85 mt-0.5 line-clamp-2">{banner.subtitle}</p>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditBanner(banner)}
                    className="w-9 h-9 rounded-xl bg-white/95 text-bode-forest shadow-md flex items-center justify-center hover:bg-white transition"
                    aria-label={`Edit ${banner.title}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {config.banners.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({ kind: 'banner', id: banner.id, title: banner.title })
                      }
                      className="w-9 h-9 rounded-xl bg-white/95 text-red-600 shadow-md flex items-center justify-center hover:bg-white transition"
                      aria-label={`Delete ${banner.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </BackofficeCard>
          ))
        )}

        {/* Trending Section */}
        <BackofficeCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-bode-forest">Trending</h2>
            <button
              type="button"
              onClick={() => setEditingTrendingList((v) => !v)}
              className="p-2 rounded-xl text-bode-emerald hover:bg-bode-ivory transition"
              aria-label="Edit trending items"
              title="Edit trending items"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {config.trending.length === 0 ? (
            <p className="text-xs text-bode-muted py-4 text-center">
              No trending items yet. Tap Create New to add one.
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {config.trending.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openEditTrending(item)}
                  className="relative w-36 sm:w-40 shrink-0 rounded-xl overflow-hidden border border-bode-border bg-bode-ivory/30 cursor-pointer group"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-2 bg-white">
                    <p className="text-xs font-semibold text-bode-forest truncate">{item.title}</p>
                    {item.linkedServiceName && (
                      <p className="text-[10px] text-bode-muted truncate">{item.linkedServiceName}</p>
                    )}
                  </div>
                  {editingTrendingList && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTrending(item);
                        }}
                        className="w-7 h-7 rounded-lg bg-white/95 text-bode-forest shadow flex items-center justify-center"
                        aria-label={`Edit ${item.title}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ kind: 'trending', id: item.id, title: item.title });
                        }}
                        className="w-7 h-7 rounded-lg bg-white/95 text-red-600 shadow flex items-center justify-center"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {editingTrendingList && (
            <button
              type="button"
              onClick={openNewTrending}
              className="w-full py-2 rounded-xl border border-dashed border-bode-emerald text-bode-emerald text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-bode-ivory/50 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Trending Item</span>
            </button>
          )}
        </BackofficeCard>

        {/* Store Website QR Code Card */}
        <BackofficeCard className="py-6 px-4 text-center space-y-4">
          <p className="text-xs sm:text-sm font-medium text-bode-muted">
            Scan the QR Code to visit our store&apos;s website.
          </p>

          <div className="inline-block p-3 rounded-2xl bg-white border border-bode-border shadow-sm">
            <StoreQrCodeSvg url={config.storeWebsiteUrl} />
          </div>

          <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="flex-1 px-3 py-2 rounded-xl bg-bode-ivory border border-bode-border text-[11px] text-bode-charcoal truncate">
              {config.storeWebsiteUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="p-2 rounded-xl border border-bode-border bg-white hover:bg-bode-ivory text-bode-forest shrink-0 transition"
              aria-label="Copy store URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={config.storeWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl border border-bode-border bg-white hover:bg-bode-ivory text-bode-forest shrink-0 transition"
              aria-label="Open store website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </BackofficeCard>
      </div>

      <BackofficeBottomBar
        mode="list"
        primaryLabel="Create New"
        onPrimary={() => setCreateChooserOpen(true)}
      />

      {/* Create New Type Chooser Bottom Sheet */}
      {createChooserOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-bode-border p-5 space-y-3 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-bode-forest">Create New</h3>
              <button
                type="button"
                onClick={() => setCreateChooserOpen(false)}
                className="p-1.5 rounded-lg text-bode-muted hover:text-bode-forest"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={openNewBanner}
              className="w-full p-3.5 rounded-xl border border-bode-border hover:bg-bode-ivory text-left flex items-center gap-3 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-bode-forest text-bode-gold flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-bode-forest">Promo Banner</p>
                <p className="text-[11px] text-bode-muted">Featured hero offer on catalogue</p>
              </div>
            </button>
            <button
              type="button"
              onClick={openNewTrending}
              className="w-full p-3.5 rounded-xl border border-bode-border hover:bg-bode-ivory text-left flex items-center gap-3 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-bode-emerald text-white flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-bode-forest">Trending Item</p>
                <p className="text-[11px] text-bode-muted">Add a card to the Trending carousel</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Edit / Create Promo Banner Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-bode-border shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="bg-bode-forest text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-base font-bold">
                {isNewBanner ? 'New Promo Banner' : 'Edit Promo Banner'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <BackofficeImageBox
                label="Banner Image"
                imageUrl={editingBanner.imageUrl}
                onChange={(url) => setEditingBanner({ ...editingBanner, imageUrl: url || '' })}
                heightClass="h-40"
              />
              <BackofficeField label="Banner Title" required error={bannerError}>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => {
                    setEditingBanner({ ...editingBanner, title: e.target.value });
                    setBannerError('');
                  }}
                  placeholder="e.g. Festive Wellness Offer — 25% OFF"
                  className={boInputCls(Boolean(bannerError))}
                />
              </BackofficeField>
              <BackofficeField label="Subtitle / Description">
                <textarea
                  rows={2}
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  placeholder="Offer details..."
                  className={boInputCls()}
                />
              </BackofficeField>
              <div className="flex items-center justify-between p-3 rounded-xl bg-bode-ivory/50 border border-bode-border">
                <span className="text-xs font-semibold text-bode-charcoal">Active</span>
                <BackofficeToggle
                  checked={editingBanner.isActive}
                  onChange={(val) => setEditingBanner({ ...editingBanner, isActive: val })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-bode-ivory/50 border border-bode-border">
                <span className="text-xs font-semibold text-bode-charcoal">Show on Digital Catalogue</span>
                <BackofficeToggle
                  checked={editingBanner.showOnCatalogue}
                  onChange={(val) => setEditingBanner({ ...editingBanner, showOnCatalogue: val })}
                />
              </div>
            </div>
            <div className="p-4 border-t border-bode-border flex items-center gap-3">
              {!isNewBanner && config.banners.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({ kind: 'banner', id: editingBanner.id, title: editingBanner.title })
                  }
                  className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                  aria-label="Delete banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="flex-1 py-2.5 rounded-xl border border-bode-border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBanner}
                className="flex-1 py-2.5 rounded-xl bg-bode-forest text-white text-xs font-semibold"
              >
                {isNewBanner ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Trending Item Modal */}
      {editingTrendItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-bode-border shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="bg-bode-forest text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-base font-bold">
                {isNewTrend ? 'Add Trending Item' : 'Edit Trending Item'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTrendItem(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <BackofficeImageBox
                label="Trending Image"
                imageUrl={editingTrendItem.imageUrl}
                onChange={(url) => setEditingTrendItem({ ...editingTrendItem, imageUrl: url || '' })}
                heightClass="h-40"
              />
              <BackofficeField label="Title" required error={trendError}>
                <input
                  type="text"
                  value={editingTrendItem.title}
                  onChange={(e) => {
                    setEditingTrendItem({ ...editingTrendItem, title: e.target.value });
                    setTrendError('');
                  }}
                  placeholder="e.g. Signature Aroma Ritual"
                  className={boInputCls(Boolean(trendError))}
                />
              </BackofficeField>
              <BackofficeField label="Linked Service / Label">
                <input
                  type="text"
                  value={editingTrendItem.linkedServiceName || ''}
                  onChange={(e) =>
                    setEditingTrendItem({ ...editingTrendItem, linkedServiceName: e.target.value })
                  }
                  placeholder="e.g. Aroma Massage 60 Min"
                  className={boInputCls()}
                />
              </BackofficeField>
            </div>
            <div className="p-4 border-t border-bode-border flex items-center gap-3">
              {!isNewTrend && (
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({
                      kind: 'trending',
                      id: editingTrendItem.id,
                      title: editingTrendItem.title,
                    })
                  }
                  className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                  aria-label="Delete trending item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setEditingTrendItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-bode-border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTrending}
                className="flex-1 py-2.5 rounded-xl bg-bode-forest text-white text-xs font-semibold"
              >
                {isNewTrend ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BackofficeConfirmDialog
        open={Boolean(deleteTarget)}
        title="Confirm Delete"
        message={`Are you sure you want to remove "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
