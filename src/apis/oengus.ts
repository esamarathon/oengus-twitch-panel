import type { TickerData, RunnerInfo } from '@/types/OengusTypes';
import { useConfigStore } from '@/stores/config';

class OengusAPI {
  private oengusDomain = 'oengus.io';

  subscribeToStore() {
    const store = useConfigStore();

    store.$subscribe(() => {
      this.oengusDomain = store.marathonConfig.oengusDomain || store.marathonConfig.domain;
    });
  }

  private get apiClean(): string {
    return `https://${this.oengusDomain}/api`;
  }

  private get apiBase(): string {
    return `${this.apiClean}/v1`;
  }

  public getAvatarUrl(username: string): string {
    return `${this.apiClean}/v2/users/${username}/avatar`;
  }

  public async getMarathonName(short: string): Promise<string> {
    const res = await fetch(`${this.apiBase}/marathons/${short}`, {
      headers: {
        'User-Agent': 'OengusIO Twitch Panel',
      },
    });

    if (res.status === 404) {
      throw new Error('Marathon not found');
    }

    const json = await res.json();

    return json.name as string;
  }

  public async getUserInfo(username: string): Promise<RunnerInfo | null> {
    const res = await fetch(`${this.apiBase}/users/${username}`, {
      headers: {
        'User-Agent': 'OengusIO Twitch Panel',
      },
    });

    if (res.status === 404) {
      return null;
    }

    return res.json();
  }

  public async getTickerData(shortCode: string): Promise<TickerData | null> {
    const res = await fetch(
      `${this.apiBase}/marathons/${shortCode}/schedule/ticker`,
      {
        headers: {
          'User-Agent': 'OengusIO Twitch Panel',
        },
      }
    );

    if (res.status !== 200) {
      return null;
    }

    return await res.json();
  }
}

export const oengusApi = new OengusAPI();
