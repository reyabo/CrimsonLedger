'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Props {
  variant?: 'primary' | 'ghost' | 'subtle' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function NewProfileDialog({ variant = 'primary', size = 'md', label = 'New character' }: Props) {
  const router = useRouter();
  const create = useLedgerStore((s) => s.createProfile);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [chronicle, setChronicle] = React.useState('');
  const [healthMax, setHealthMax] = React.useState(7);
  const [willpowerMax, setWillpowerMax] = React.useState(5);

  function commit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = create({
      name: trimmed,
      chronicle: chronicle.trim() || undefined,
      health: { max: clampNum(healthMax), superficial: 0, aggravated: 0 },
      willpower: { max: clampNum(willpowerMax), superficial: 0, aggravated: 0 },
    });
    setOpen(false);
    setName('');
    setChronicle('');
    router.push(`/profile?id=${id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Plus className="h-4 w-4" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New character</DialogTitle>
          <DialogDescription>
            Only session values — change anything later from the profile page.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            commit();
          }}
          className="flex flex-col gap-3"
        >
          <div>
            <Label htmlFor="np-name">Name</Label>
            <Input
              id="np-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rook"
              maxLength={64}
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="np-chronicle">Chronicle (optional)</Label>
            <Input
              id="np-chronicle"
              value={chronicle}
              onChange={(e) => setChronicle(e.target.value)}
              placeholder="e.g. Chicago by Night"
              maxLength={64}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="np-health">Health max</Label>
              <Input
                id="np-health"
                type="number"
                min={1}
                max={20}
                value={healthMax}
                onChange={(e) => setHealthMax(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="np-willpower">Willpower max</Label>
              <Input
                id="np-willpower"
                type="number"
                min={1}
                max={20}
                value={willpowerMax}
                onChange={(e) => setWillpowerMax(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function clampNum(n: number): number {
  if (!Number.isFinite(n)) return 7;
  return Math.max(1, Math.min(20, Math.trunc(n)));
}
