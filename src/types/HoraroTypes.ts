import type { Config } from '@/types/OengusTypes';

export interface HoraroSchedule {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  start: string;
  start_t: number;
  setup: string;
  setup_t: number;
  updated: string;
  columns: string[];
  hidden_columns?: string[];
  link: string;
}

export interface HoraroRun {
  length: string;
  length_t: number;
  scheduled: string;
  scheduled_t: number;
  data: string[];
}

export interface HoraroTickerData {
  schedule: HoraroSchedule;
  ticker: {
    previous: HoraroRun | null;
    current: HoraroRun | null;
    next: HoraroRun | null;
  };
  /**
   * @deprecated - do not use
   */
  items: HoraroRun[];
}

export interface HoraroResponse<T> {
  data: T;
}

export interface HoraroConfig extends Config<'HORARO'> {
  marathonId: string;
  marathonName: string;
  hiddenDataKey: string;
}
