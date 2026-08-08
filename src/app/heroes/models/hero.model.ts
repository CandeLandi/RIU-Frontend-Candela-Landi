export type HeroUniverse = 'Marvel' | 'DC' | 'Other';

export interface Hero {
  id: number;
  name: string;
  alterEgo?: string;
  power: string;
  universe: HeroUniverse;
  description?: string;
}

export type HeroCreate = Omit<Hero, 'id'>;
export type HeroUpdate = Partial<HeroCreate>;
