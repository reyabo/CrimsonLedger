import type { Profile } from '@/domain/types';
import { hungerSeverity, humanitySeverity, isImpaired, isTorpor, totalDamage } from '@/domain/rules';

export type ProfileStatus = {
  hunger: 'normal' | 'high' | 'critical';
  humanity: 'normal' | 'low' | 'critical';
  healthImpaired: boolean;
  healthTorpor: boolean;
  willpowerImpaired: boolean;
  healthRemaining: number;
  willpowerRemaining: number;
};

export function computeStatus(p: Profile): ProfileStatus {
  return {
    hunger: hungerSeverity(p.thirst),
    humanity: humanitySeverity(p.morality),
    healthImpaired: isImpaired(p.health),
    healthTorpor: isTorpor(p.health),
    willpowerImpaired: isImpaired(p.willpower),
    healthRemaining: Math.max(0, p.health.max - totalDamage(p.health)),
    willpowerRemaining: Math.max(0, p.willpower.max - totalDamage(p.willpower)),
  };
}
