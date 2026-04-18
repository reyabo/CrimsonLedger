'use client';

import * as React from 'react';
import Link from 'next/link';
import { Download, Upload, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { buildEnvelope, downloadJson, filenameForAll, parseEnvelope, readFileAsText } from '@/lib/io';

export function TopBar() {
  const profiles = useLedgerStore((s) =>
    s.order.map((id) => s.profiles[id]).filter(Boolean),
  );
  const importReplace = useLedgerStore((s) => s.importReplace);
  const importMerge = useLedgerStore((s) => s.importMerge);

  const [importOpen, setImportOpen] = React.useState(false);
  const [pending, setPending] = React.useState<{ count: number; data: ReturnType<typeof buildEnvelope> } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const text = await readFileAsText(f);
      const env = parseEnvelope(text);
      setPending({ count: env.profiles.length, data: env });
      setError(null);
      setImportOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not parse file');
      setImportOpen(true);
    }
  }

  function onExportAll() {
    downloadJson(filenameForAll(), buildEnvelope(profiles));
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-3 bg-ink-0/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-6 w-6 rounded-full border border-crimson bg-gradient-to-br from-crimson-bright to-crimson-deep"
          />
          <div className="leading-tight">
            <p className="font-serif text-lg text-bone">Crimson Ledger</p>
            <p className="text-[10px] uppercase tracking-widest text-bone-muted">Session tracker</p>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="App menu">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onExportAll} disabled={profiles.length === 0}>
              <Download className="h-4 w-4" /> Export all JSON
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <label className="flex cursor-pointer items-center gap-2">
                <Upload className="h-4 w-4" /> Import JSON…
                <input type="file" accept="application/json" className="sr-only" onChange={onFile} />
              </label>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href="https://github.com/"
                className="flex items-center gap-2"
                target="_blank"
                rel="noreferrer"
              >
                About / source
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import profiles</DialogTitle>
            <DialogDescription>
              {error ? (
                <span className="text-danger">{error}</span>
              ) : pending ? (
                <>Found {pending.count} profile(s). Choose how to bring them in.</>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            {pending && !error ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    importMerge(pending.data.profiles);
                    setImportOpen(false);
                    setPending(null);
                  }}
                >
                  Merge (new IDs)
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    importReplace(pending.data.profiles);
                    setImportOpen(false);
                    setPending(null);
                  }}
                >
                  Replace everything
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
