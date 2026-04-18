import * as React from 'react';
import { AlertTriangle, Skull, HeartCrack } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Kind = 'impaired' | 'torpor' | 'degeneration';

const CONFIG: Record<Kind, { label: string; variant: 'warn' | 'danger' | 'crimson'; Icon: typeof AlertTriangle }> = {
  impaired: { label: 'Impaired', variant: 'warn', Icon: HeartCrack },
  torpor: { label: 'Torpor', variant: 'danger', Icon: Skull },
  degeneration: { label: 'Degeneration risk', variant: 'crimson', Icon: AlertTriangle },
};

export function DangerBadge({ kind }: { kind: Kind }) {
  const { label, variant, Icon } = CONFIG[kind];
  return (
    <Badge variant={variant}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
