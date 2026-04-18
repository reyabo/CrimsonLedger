'use client';

import * as React from 'react';
import { Minus, Plus, Trash2, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionCard } from '@/components/common/SectionCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLedgerStore } from '@/store/ledgerStore';
import { newId } from '@/lib/id';
import type { CustomTracker, CustomTrackerDisplay, Profile } from '@/domain/types';

export function CustomTrackers({ profile }: { profile: Profile }) {
  return (
    <SectionCard
      title="Custom Trackers"
      subtitle={profile.customTrackers.length === 0 ? 'For blood surge dice, boons, anything else that moves' : undefined}
      actions={<NewCustomTrackerDialog profileId={profile.id} />}
    >
      {profile.customTrackers.length === 0 ? (
        <p className="text-sm text-bone-dim">No custom trackers yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {profile.customTrackers.map((t) => (
            <li key={t.id}>
              <CustomTrackerRow profileId={profile.id} tracker={t} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function CustomTrackerRow({ profileId, tracker }: { profileId: string; tracker: CustomTracker }) {
  const adjust = useLedgerStore((s) => s.adjustCustomTracker);
  const toggle = useLedgerStore((s) => s.toggleChecklistItem);
  const remove = useLedgerStore((s) => s.removeCustomTracker);

  return (
    <div className="rounded-md border border-ink-3 bg-ink-2 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-bone">{tracker.label}</p>
          <p className="text-xs text-bone-muted">
            {tracker.displayType === 'checklist'
              ? `${tracker.currentValue} / ${tracker.maxValue ?? 0} checked`
              : tracker.maxValue !== undefined
                ? `${tracker.currentValue} / ${tracker.maxValue}`
                : `${tracker.currentValue}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <EditCustomTrackerDialog profileId={profileId} tracker={tracker} />
          <Button
            variant="ghost"
            size="iconSm"
            aria-label={`Delete ${tracker.label}`}
            onClick={() => remove(profileId, tracker.id)}
          >
            <Trash2 className="h-4 w-4 text-danger/80" />
          </Button>
        </div>
      </div>

      {tracker.displayType === 'counter' ? (
        <div className="flex items-center gap-2">
          <Button
            variant="subtle"
            size="iconSm"
            aria-label="Decrease"
            onClick={() => adjust(profileId, tracker.id, -1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center text-lg tabular-nums">{tracker.currentValue}</span>
          <Button
            variant="subtle"
            size="iconSm"
            aria-label="Increase"
            onClick={() => adjust(profileId, tracker.id, +1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {tracker.displayType === 'pips' ? (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={tracker.label}>
          {Array.from({ length: tracker.maxValue ?? 0 }, (_, i) => {
            const filled = i < tracker.currentValue;
            return (
              <button
                key={i}
                type="button"
                aria-label={`${tracker.label} pip ${i + 1}`}
                onClick={() => {
                  const cur = tracker.currentValue;
                  const max = tracker.maxValue ?? 0;
                  const next = i + 1 === cur ? i : i + 1;
                  adjust(profileId, tracker.id, Math.max(0, Math.min(max, next)) - cur);
                }}
                className={
                  'h-6 w-6 rounded-[3px] border transition-colors ' +
                  (filled
                    ? 'border-bone/40 bg-bone/80'
                    : 'border-ink-3 bg-ink-0 hover:border-bone/60')
                }
              />
            );
          })}
        </div>
      ) : null}

      {tracker.displayType === 'checklist' ? (
        <ul className="flex flex-col gap-1">
          {(tracker.items ?? []).slice(0, tracker.maxValue ?? 0).map((label, i) => {
            const checked = i < tracker.currentValue;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => toggle(profileId, tracker.id, i)}
                  className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-sm hover:bg-ink-3"
                >
                  <span
                    aria-hidden
                    className={
                      'flex h-4 w-4 items-center justify-center rounded-sm border ' +
                      (checked ? 'border-crimson bg-crimson/60' : 'border-ink-3 bg-ink-1')
                    }
                  >
                    {checked ? '✓' : ''}
                  </span>
                  <span className={checked ? 'text-bone line-through opacity-70' : 'text-bone'}>
                    {label || `Item ${i + 1}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function NewCustomTrackerDialog({ profileId }: { profileId: string }) {
  const add = useLedgerStore((s) => s.addCustomTracker);
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="subtle" size="sm">
          <Plus className="h-4 w-4" /> Add tracker
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New custom tracker</DialogTitle>
          <DialogDescription>
            Quick counters, pip tracks, or short checklists for house rules.
          </DialogDescription>
        </DialogHeader>
        <CustomTrackerForm
          submitLabel="Add"
          onSubmit={(t) => {
            add(profileId, t);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditCustomTrackerDialog({
  profileId,
  tracker,
}: {
  profileId: string;
  tracker: CustomTracker;
}) {
  const update = useLedgerStore((s) => s.updateCustomTracker);
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="iconSm" aria-label={`Edit ${tracker.label}`}>
          <PencilLine className="h-4 w-4 text-bone-muted" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit tracker</DialogTitle>
        </DialogHeader>
        <CustomTrackerForm
          initial={tracker}
          submitLabel="Save"
          onSubmit={(t) => {
            update(profileId, { ...tracker, ...t, id: tracker.id });
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function CustomTrackerForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<CustomTracker>;
  submitLabel: string;
  onSubmit: (t: Omit<CustomTracker, 'id'>) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = React.useState(initial?.label ?? '');
  const [displayType, setDisplayType] = React.useState<CustomTrackerDisplay>(
    initial?.displayType ?? 'counter',
  );
  const [maxValue, setMaxValue] = React.useState<string>(
    initial?.maxValue !== undefined ? String(initial.maxValue) : '',
  );
  const [itemsText, setItemsText] = React.useState<string>((initial?.items ?? []).join('\n'));

  const isPipsOrChecklist = displayType === 'pips' || displayType === 'checklist';
  const canSubmit = label.trim().length > 0 && (!isPipsOrChecklist || Number(maxValue) > 0);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        const maxNum = maxValue === '' ? undefined : Number(maxValue);
        const items =
          displayType === 'checklist'
            ? itemsText
                .split(/\n+/)
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, maxNum ?? 0)
            : undefined;
        onSubmit({
          label: label.trim(),
          displayType,
          currentValue: initial?.currentValue ?? 0,
          maxValue: maxNum,
          items,
        });
      }}
      className="flex flex-col gap-3"
    >
      <div>
        <Label htmlFor="t-label">Label</Label>
        <Input
          id="t-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Blood Surge, Stored Vitae, …"
          autoFocus
        />
      </div>

      <div>
        <Label>Display</Label>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {(['counter', 'pips', 'checklist'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDisplayType(d)}
              className={
                'rounded-md border px-2 py-2 text-xs capitalize ' +
                (displayType === d
                  ? 'border-crimson bg-crimson/20 text-bone'
                  : 'border-ink-3 bg-ink-1 text-bone-muted hover:bg-ink-2')
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="t-max">
          {displayType === 'counter' ? 'Max (optional)' : 'Max (required)'}
        </Label>
        <Input
          id="t-max"
          type="number"
          min={0}
          max={99}
          value={maxValue}
          onChange={(e) => setMaxValue(e.target.value)}
          placeholder={displayType === 'counter' ? 'leave empty for unbounded' : '5'}
        />
      </div>

      {displayType === 'checklist' ? (
        <div>
          <Label htmlFor="t-items">Items (one per line)</Label>
          <textarea
            id="t-items"
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-ink-3 bg-ink-1 px-3 py-2 text-sm text-bone placeholder:text-bone-dim focus:outline-none focus:ring-2 focus:ring-crimson"
            placeholder={'First plan\nSecond plan\nThird plan'}
          />
        </div>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
