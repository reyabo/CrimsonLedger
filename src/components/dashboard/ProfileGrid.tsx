'use client';

import * as React from 'react';
import { ProfileCard } from './ProfileCard';
import type { Profile } from '@/domain/types';

export function ProfileGrid({ profiles, label }: { profiles: Profile[]; label?: string }) {
  if (profiles.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      {label ? (
        <h2 className="text-xs uppercase tracking-widest text-bone-dim">{label}</h2>
      ) : null}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <li key={p.id}>
            <ProfileCard profile={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
