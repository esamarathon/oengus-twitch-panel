<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useConfigStore } from '@/stores/config';
import * as bulmaToast from 'bulma-toast';
import { oengusApi } from '@/apis/oengus';
import { storeToRefs } from 'pinia';
import OengusConfig from '@/components/config/OengusConfig.vue';
import HoraroConfig from '@/components/config/HoraroConfig.vue';
import { horaroApi } from '@/apis/horaro';
import { getColumnIndexes, indexToName } from '@/helpers/horaroHelpers';

export default defineComponent({
  name: 'config-view',
  components: {
    HoraroConfig,
    OengusConfig,
  },
  setup() {
    const configStore = useConfigStore();
    const { marathonConfig } = storeToRefs(configStore);
    const oengusDomains = ['oengus.io', 'sandbox.oengus.io', 'horaro.org'];

    if (document.location.host === 'localhost:5173') {
      oengusDomains.push('oengus.dev');
    }

    const horaroEventSlug = ref('esa');

    return {
      configStore,
      oengusDomains,
      cfg: marathonConfig,
      horaroEventSlug,
    };
  },
  watch: {
    'cfg.domain'(domain: string) {
      this.cfg.type = domain === 'horaro.org' ? 'HORARO' : 'OENGUS';

      if (this.cfg.type === 'HORARO') {
        this.cfg.oengusDomain = 'oengus.io';
        this.cfg.marathonName = '';
        this.cfg.hiddenDataKey = '';
        this.cfg.marathonId = '';
        this.cfg.scheduleSlug = '';
      } else {
        this.cfg.marathonId = '';
        this.cfg.scheduleSlug = '';
        this.cfg.scheduleId = -1;
        this.cfg.oengusDomain = '';
      }
    },
  },
  methods: {
    clearExt() {
      this.cfg.marathonId = '';
      this.cfg.scheduleId = -1;
      this.cfg.scheduleSlug = '';
      this.save();
    },
    async loadOengusData(marathonId: string): Promise<void> {
      this.cfg.marathonName = await oengusApi.getMarathonName(marathonId);
      const schedule = await oengusApi.lookupSchedule(
        marathonId,
        this.cfg.scheduleSlug
      );

      this.cfg.scheduleId = schedule?.id ?? -1;
    },
    async loadHoraroData(): Promise<boolean> {
      const data = await horaroApi.loadBasicScheduleInfo(
        this.horaroEventSlug,
        this.cfg.scheduleSlug
      );

      const indexes = Object.entries(getColumnIndexes(data));
      const missing = [];

      for (const [key, value] of indexes) {
        if (value === -1) {
          // This key is valid, we know as it comes from the indexes
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          missing.push(indexToName(key));
        }
      }

      if (missing.length > 0) {
        bulmaToast.toast({
          duration: 10000,
          single: true,
          message: `Did not manage to find the following columns in your schedule: ${missing.join(
            ', '
          )}`,
          type: 'is-warning',
          position: 'top-center',
          dismissible: true,
        });
        return false;
      }

      this.cfg.marathonId = data.schedule.id;
      this.cfg.marathonName = data.schedule.name;

      return true;
    },
    async save(): Promise<void> {
      bulmaToast.toast({
        duration: 4000,
        single: true,
        message: 'Saving....',
        type: 'is-warning',
        position: 'top-center',
        dismissible: true,
      });

      const marathonId = this.cfg.marathonId || this.cfg.scheduleSlug;

      try {
        if (marathonId) {
          if (this.cfg.type === 'OENGUS') {
            await this.loadOengusData(marathonId);
          } else {
            const res = await this.loadHoraroData();

            if (!res) {
              return;
            }
          }
        } else {
          this.cfg.marathonName = 'None';
        }

        console.log(this.cfg.marathonName);

        this.configStore.saveToTwitch();

        // TODO: fork and fix
        bulmaToast.toast({
          duration: 2000,
          single: true,
          message: 'Config saved!',
          type: 'is-success',
          position: 'top-center',
          dismissible: true,
        });
      } catch (e) {
        bulmaToast.toast({
          duration: 10000,
          single: true,
          message: `No marathon with id "${marathonId}" found.`,
          type: 'is-warning',
          position: 'top-center',
          dismissible: true,
        });
      }
    },
  },
});
</script>

<template>
  <section class="section">
    <h2 class="title">Oengus Extension Configuration</h2>

    <div class="container">
      <p v-if="cfg.type === 'HORARO'">
        <b>WARNING:</b> Horaro support is very experimental and may not work as
        expected as it's designed to work with an ESA schedule. <br />
        Becacuse of this the following fields are required: "Game", "Platform",
        "Category", "Player(s)"
      </p>
      <br />
      <form action="#">
        <OengusConfig
          v-if="cfg.type === 'OENGUS'"
          v-model:marathon-id="cfg.marathonId"
          v-model:domain="cfg.domain"
          v-model:schedule-slug="cfg.scheduleSlug"
          :oengus-domains="oengusDomains"
          :marathon-name="cfg.marathonName"
        />
        <HoraroConfig
          v-else
          :marathon-name="cfg.marathonName"
          :oengus-domains="oengusDomains"
          v-model:domain="cfg.domain"
          v-model:event-slug="horaroEventSlug"
          v-model:schedule-slug="cfg.scheduleSlug"
          v-model:hidden-data-key="cfg.hiddenDataKey"
        />

        <div class="field is-grouped">
          <div class="control">
            <button
              class="button is-success"
              type="button"
              @click.prevent="save"
            >
              Save
            </button>
          </div>
          <div class="control">
            <button
              class="button is-danger"
              type="button"
              @click.prevent="clearExt"
            >
              Disable extension
            </button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped lang="scss">
//
</style>
