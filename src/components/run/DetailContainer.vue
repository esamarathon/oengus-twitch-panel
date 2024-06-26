<template>
  <div class="run-detail-container">
    <div class="header">
      <h4 class="title is-4">
        {{ run.setupBlock ? run.setupBlockText || 'Setup Block' : run.game }}
      </h4>
    </div>

    <template v-if="run.date">
      <span class="is-label">Time</span>
      <span>
        {{ $d(run.date) }}
        ({{ dateDistance(run.date) }})
      </span>
    </template>

    <template v-if="run.category">
      <span class="is-label">Category</span>
      <span>
        {{ run.category }}
      </span>
    </template>

    <template v-if="run.type">
      <span class="is-label">Type</span>
      <span>
        {{ run.type /* TODO: map to type */ }}
      </span>
    </template>

    <template v-if="run.console">
      <span class="is-label">Console</span>
      <ElementConsole :console="run.console" :is-emulated="run.emulated" />
    </template>

    <template v-if="run.estimate">
      <span class="is-label">Estimate</span>
      {{ parseDuration(run.estimate) }}
    </template>

    <template v-if="run.setupTime">
      <span class="is-label">Setup time</span>
      {{ parseDuration(run.setupTime) }}
    </template>

    <template v-if="isOengusSchedule">
      <span class="is-label">Link</span>
      <!-- TODO: use helper to select correct domain and template url -->
      <a
        :href="`https://${oengusDomain}/marathon/${marathonId}/schedule/${scheduleSlug}#run-${run.id}`"
        target="_blank"
        rel="nofollow"
      >
        #run-{{ run.id }}
      </a>
    </template>
  </div>
</template>

<script lang="ts">
// Adapted from https://github.com/esamarathon/oengus-webapp/blob/v2/components/marathon/schedule/Run.vue
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { TickerRun } from '@/types/OengusTypes';
import ElementConsole from '@/components/stolen-from-main-site/ElementConsole.vue';
import { getTimeDistance } from '@/helpers/timehelper';
import { duration } from '@/helpers/durationParser';
import { useConfigStore } from '@/stores/config';

export default defineComponent({
  components: {
    ElementConsole,
  },
  props: {
    run: {
      type: Object as PropType<TickerRun>,
      required: true,
    },
    scheduleSlug: {
      type: String,
      required: true,
    },
    marathonId: {
      type: String,
      required: true,
    },
  },
  setup() {
    const configStore = useConfigStore();

    return {
      configStore,
    };
  },
  methods: {
    dateDistance(d: string | number | Date) {
      return getTimeDistance(d);
    },
    parseDuration(dur: string) {
      return duration.toHumanReadable(dur);
    },
    // TODO: install vue-i18n
    $d(date: string | Date): string {
      const d = new Date(date);
      const h = (i: number) => (i < 9 ? `0${i}` : `${i}`);
      return `${h(d.getHours())}:${h(d.getMinutes())}`;
    },
  },
  computed: {
    oengusDomain(): string {
      return this.configStore.marathonConfig.domain;
    },
    isOengusSchedule(): boolean {
      return this.configStore.marathonConfig.type === 'OENGUS';
    },
  },
});
</script>

<style lang="scss" scoped>
.run-detail-container {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-auto-rows: auto;
  gap: calc(var(--spacing) / 2);

  > .header {
    grid-column: 1 / -1;
    text-align: center;

    > .title {
      margin-block-end: calc(var(--spacing) / 2);
    }
  }

  > .is-label {
    font-weight: bold;
    justify-self: end;
    white-space: nowrap;

    &::after {
      content: ':';
    }
  }

  > *:not(.is-label) {
    overflow-x: auto;
  }
}
</style>
