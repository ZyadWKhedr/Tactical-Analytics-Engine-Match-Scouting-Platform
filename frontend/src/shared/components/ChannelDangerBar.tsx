import React from 'react';
import { cn } from '../lib/utils';
import { useI18n } from '../i18n';

export interface ChannelDanger {
  left: number;
  centre: number;
  right: number;
}

interface ChannelDangerBarProps {
  channels?: ChannelDanger;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function ChannelDangerBar({
  channels = { left: 28, centre: 24, right: 48 },
  title,
  subtitle,
  className,
}: ChannelDangerBarProps) {
  const { t } = useI18n();

  const items = [
    { name: t.leftFlank, val: channels.left, key: 'left' },
    { name: t.centralChannel, val: channels.centre, key: 'centre' },
    { name: t.rightFlank, val: channels.right, key: 'right' },
  ];

  const maxVal = Math.max(channels.left, channels.centre, channels.right);

  return (
    <div className={cn('p-4 sm:p-5 space-y-3 font-sans', className)}>
      <div className="border-b border-[var(--border)] pb-2">
        <h4 className="text-sm font-bold text-[var(--text)]">
          {title || t.attackShareByChannel}
        </h4>
        <p className="text-3xs text-[var(--text-3)] mt-0.5">
          {subtitle || t.attackShareSubtitle}
        </p>
      </div>

      <div className="space-y-3 pt-1">
        {items.map((item) => {
          const isHighest = item.val === maxVal;
          return (
            <div key={item.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={cn('font-medium', isHighest ? 'text-[var(--text)] font-semibold' : 'text-[var(--text-2)]')}>
                  {item.name} {isHighest && <span className="text-3xs text-[var(--accent)] font-semibold ms-1.5 px-1.5 py-0.5 rounded bg-[var(--accent)]/15">{t.focus}</span>}
                </span>
                <span className={cn('font-mono tabular-nums text-xs', isHighest ? 'font-bold text-[var(--accent)]' : 'text-[var(--text-3)]')}>
                  {item.val}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--panel-2)] border border-[var(--border)] overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isHighest ? 'bg-[var(--accent)]' : 'bg-[var(--text-3)]/40'
                  )}
                  style={{ width: `${Math.min(item.val, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
