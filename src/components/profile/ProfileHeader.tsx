'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Archive, ArchiveRestore, Download, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLedgerStore } from '@/store/ledgerStore';
import type { Profile } from '@/domain/types';
import { buildEnvelope, downloadJson, filenameForProfile } from '@/lib/io';

export function ProfileHeader({ profile }: { profile: Profile }) {
  const router = useRouter();
  const rename = useLedgerStore((s) => s.renameProfile);
  const duplicate = useLedgerStore((s) => s.duplicateProfile);
  const archive = useLedgerStore((s) => s.archiveProfile);
  const remove = useLedgerStore((s) => s.deleteProfile);

  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(profile.name);
  const [chronicle, setChronicle] = React.useState(profile.chronicle ?? '');
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  React.useEffect(() => {
    setName(profile.name);
    setChronicle(profile.chronicle ?? '');
  }, [profile.id, profile.name, profile.chronicle]);

  function commitRename() {
    const trimmed = name.trim();
    if (!trimmed) return;
    rename(profile.id, trimmed, chronicle.trim() || undefined);
    setEditing(false);
  }

  function handleDuplicate() {
    const id = duplicate(profile.id);
    if (id) router.push(`/profile?id=${id}`);
  }

  function handleExport() {
    downloadJson(filenameForProfile(profile), buildEnvelope([profile]));
  }

  return (
    <header className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/"
          className="rounded-md p-2 text-bone-muted hover:bg-ink-2 hover:text-bone"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="block max-w-full truncate text-left font-serif text-xl text-bone hover:underline"
          >
            {profile.name}
          </button>
          {profile.chronicle ? (
            <p className="truncate text-xs uppercase tracking-wider text-bone-muted">
              {profile.chronicle}
            </p>
          ) : null}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Profile menu">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditing(true)}>Rename…</DropdownMenuItem>
          <DropdownMenuItem onSelect={handleDuplicate}>
            <Copy className="h-4 w-4" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleExport}>
            <Download className="h-4 w-4" /> Export JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => archive(profile.id, !profile.archived)}>
            {profile.archived ? (
              <>
                <ArchiveRestore className="h-4 w-4" /> Unarchive
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" /> Archive
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem danger onSelect={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" /> Delete…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Rename this character and tag it to a chronicle.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commitRename();
            }}
            className="flex flex-col gap-3"
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              maxLength={64}
              autoFocus
            />
            <Input
              value={chronicle}
              onChange={(e) => setChronicle(e.target.value)}
              placeholder="Chronicle (optional)"
              maxLength={64}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {profile.name}?</DialogTitle>
            <DialogDescription>
              This removes the profile from this device. You can undo immediately with the snackbar,
              or export a backup first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                remove(profile.id);
                setConfirmDelete(false);
                router.push('/');
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
