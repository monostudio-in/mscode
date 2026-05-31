// src/features/extensions/detail/sections/ReviewTab.tsx
//
// Shows the community reviews for an extension fetched directly from Supabase.
// Writing / replying is intentionally disabled inside the editor — a prominent
// CTA redirects the user to the website where the full review UI lives.
//
// Layout mirrors item.tsx (website) so reviewers see a familiar experience.

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/core/server/supabaseClient';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Base URL of the published store website. Update to match your deployment. */
const STORE_BASE_URL = 'https://store.monostudio.dev';

/** Opens a URL in the system default browser (Capacitor / Electron / web). */
const openExternal = (url: string) => {
  try {
    // Works for both Electron (via shell.openExternal in preload) and a plain web view
    if (typeof window !== 'undefined' && (window as any).electronAPI?.openExternal) {
      (window as any).electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reply {
  id: string;
  review_id: string;
  parent_id: string | null;
  user_name: string;
  avatar_url: string;
  reply_text: string;
  created_at: string;
}

interface Review {
  id: string;
  user_name: string;
  avatar_url: string;
  ux_rating: number;
  perf_rating: number;
  bug_rating: number;
  avg_rating: number;
  comment_text: string | null;
  created_at: string;
  extension_replies: Reply[];
}

interface ReviewTabProps {
  extensionId: string;
  /** Overall average rating already stored on the extension record. */
  avgRating?: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StarDisplay: React.FC<{ value: number; max?: number }> = ({ value, max = 5 }) => (
  <span style={{ display: 'inline-flex', gap: '1px', color: 'var(--ms-warning, #e5c07b)', fontSize: '13px' }}>
    {Array.from({ length: max }, (_, i) => (
      <span key={i} style={{ opacity: i < Math.round(value) ? 1 : 0.25 }}>★</span>
    ))}
  </span>
);

const Avatar: React.FC<{ src?: string; name: string; size?: number }> = ({ src, name, size = 28 }) => (
  src
    ? <img src={src} alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    : <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'var(--ms-bg-active, #3a3d41)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45, fontWeight: 700, color: 'var(--ms-text-bright, #fff)',
      }}>
        {name.charAt(0).toUpperCase()}
      </div>
);

// ─── Recursive reply thread ───────────────────────────────────────────────────

const ReplyThread: React.FC<{ replies: Reply[]; parentId: string | null; depth?: number }> = ({
  replies, parentId, depth = 0,
}) => {
  const children = replies
    .filter(r => r.parent_id === parentId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (children.length === 0) return null;

  return (
    <div style={{
      marginTop: '10px',
      marginLeft: depth > 0 ? '20px' : '0',
      borderLeft: depth > 0 ? '2px solid var(--ms-border, #3e3e3e)' : 'none',
      paddingLeft: depth > 0 ? '14px' : '0',
    }}>
      {children.map(reply => (
        <div key={reply.id} style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <Avatar src={reply.avatar_url} name={reply.user_name} size={22} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ms-text-bright, #d4d4d4)' }}>
                  {reply.user_name}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--ms-text-faded, #6b6b6b)' }}>
                  {new Date(reply.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--ms-text-main, #cccccc)', lineHeight: 1.5 }}>
                {reply.reply_text}
              </p>
              {/* Nested children */}
              <ReplyThread replies={replies} parentId={reply.id} depth={depth + 1} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Rating breakdown row ─────────────────────────────────────────────────────

const RatingRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
    <span style={{ width: '120px', color: 'var(--ms-text-faded, #6b6b6b)', flexShrink: 0 }}>{label}</span>
    <StarDisplay value={value} />
    <span style={{ color: 'var(--ms-text-main, #cccccc)', minWidth: '24px' }}>{value.toFixed(1)}</span>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const ReviewTab: React.FC<ReviewTabProps> = ({ extensionId, avgRating = 0 }) => {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const reviewPageUrl = `${STORE_BASE_URL}/store/item?id=${encodeURIComponent(extensionId)}`;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('extension_reviews')
        .select('*, extension_replies(*)')
        .eq('extension_id', extensionId)
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;
      setReviews((data as Review[]) ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, [extensionId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // ── Derived aggregates ──────────────────────────────────────────────────────
  const totalReviews = reviews.length;
  const avgUx   = totalReviews ? reviews.reduce((s, r) => s + r.ux_rating,   0) / totalReviews : 0;
  const avgPerf = totalReviews ? reviews.reduce((s, r) => s + r.perf_rating, 0) / totalReviews : 0;
  const avgBug  = totalReviews ? reviews.reduce((s, r) => s + r.bug_rating,  0) / totalReviews : 0;
  const displayRating = totalReviews
    ? reviews.reduce((s, r) => s + Number(r.avg_rating), 0) / totalReviews
    : avgRating;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Rating summary card ── */}
      <div style={{
        background: 'var(--ms-bg-sidebar, #252526)',
        border: '1px solid var(--ms-border, #3e3e3e)',
        borderRadius: '6px',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>

          {/* Big number */}
          <div style={{ textAlign: 'center', minWidth: '72px' }}>
            <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1, color: 'var(--ms-text-bright, #fff)' }}>
              {displayRating.toFixed(1)}
            </div>
            <StarDisplay value={displayRating} />
            <div style={{ fontSize: '10px', color: 'var(--ms-text-faded, #6b6b6b)', marginTop: '4px' }}>
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Breakdown */}
          {totalReviews > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <RatingRow label="User Experience"  value={avgUx}   />
              <RatingRow label="Performance"       value={avgPerf} />
              <RatingRow label="Bug Free"          value={avgBug}  />
            </div>
          )}
        </div>

        {/* CTA ── always shown */}
        <div style={{
          marginTop: '18px',
          padding: '12px 14px',
          background: 'var(--ms-bg-active, #2d2d30)',
          borderRadius: '4px',
          border: '1px solid var(--ms-border, #3e3e3e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--ms-text-faded, #6b6b6b)' }}>
            To rate or write a review, visit the Mono Studio Store website.
          </span>
          <button
            onClick={() => openExternal(reviewPageUrl)}
            style={{
              background: 'var(--ms-accent, #007acc)',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              padding: '5px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Write a Review ↗
          </button>
        </div>
      </div>

      {/* ── Loading / error states ── */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ms-text-faded, #6b6b6b)', fontSize: '13px' }}>
          Loading reviews…
        </div>
      )}

      {!isLoading && error && (
        <div style={{
          padding: '14px 16px',
          background: 'rgba(255,77,77,0.08)',
          border: '1px solid rgba(255,77,77,0.3)',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#ff4d4d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <span>{error}</span>
          <button
            onClick={fetchReviews}
            style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline', padding: 0 }}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && totalReviews === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ms-text-faded, #6b6b6b)', fontSize: '13px' }}>
          No reviews yet. Be the first to review this extension on the store!
        </div>
      )}

      {/* ── Review cards ── */}
      {!isLoading && !error && reviews.map(rev => (
        <div key={rev.id} style={{
          background: 'var(--ms-bg-sidebar, #252526)',
          border: '1px solid var(--ms-border, #3e3e3e)',
          borderRadius: '6px',
          padding: '16px',
        }}>
          {/* Review header */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <Avatar src={rev.avatar_url} name={rev.user_name || 'A'} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ms-text-bright, #d4d4d4)' }}>
                  {rev.user_name || 'Anonymous'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--ms-text-faded, #6b6b6b)' }}>
                  {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>
              <div style={{ marginTop: '3px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <StarDisplay value={Number(rev.avg_rating)} />
                <span style={{ fontSize: '11px', color: 'var(--ms-text-faded, #6b6b6b)' }}>
                  {Number(rev.avg_rating).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Rating breakdown */}
          <div style={{
            display: 'flex', gap: '14px', flexWrap: 'wrap',
            padding: '8px 10px',
            background: 'var(--ms-bg-active, #2d2d30)',
            borderRadius: '4px',
            marginBottom: rev.comment_text ? '12px' : '0',
            fontSize: '11px',
          }}>
            {[
              { label: 'UX',   value: rev.ux_rating   },
              { label: 'Perf', value: rev.perf_rating  },
              { label: 'Bugs', value: rev.bug_rating   },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: 'var(--ms-text-faded, #6b6b6b)' }}>{label}</span>
                <StarDisplay value={value} />
              </div>
            ))}
          </div>

          {/* Comment */}
          {rev.comment_text && (
            <p style={{
              margin: '12px 0 0',
              fontSize: '13px',
              color: 'var(--ms-text-main, #cccccc)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {rev.comment_text}
            </p>
          )}

          {/* Reply thread */}
          {rev.extension_replies && rev.extension_replies.length > 0 && (
            <ReplyThread
              replies={rev.extension_replies}
              parentId={null}
              depth={0}
            />
          )}
        </div>
      ))}
    </div>
  );
};