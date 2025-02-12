<template>
  <div class="extend-container">
    <div class="mt-12 mb-24">
      <div class="text-center">
        <h1 class="text-center text-3xl font-bold tracking-tight sm:text-5xl">
          Factor Showcase
        </h1>
        <h3 class="mt-4 text-2xl text-slate-500">
          Examples of Factor in Production
        </h3>
      </div>
    </div>

    <div class="m-auto mb-24 max-w-screen-xl px-4">
      <div class="theme-grid grid grid-cols-12 gap-4 lg:gap-8">
        <div
          v-for="(item, index) in showcase"
          :key="index"
          class="grid-item-theme col-span-12 cursor-pointer md:col-span-6 lg:col-span-4"
          @click="goToPermalink(item.permalink)"
        >
          <div
            class="theme-wrap relative aspect-[2/3] overflow-hidden rounded-md bg-cover bg-top shadow-lg ring-1 ring-black/10"
            :style="{ backgroundImage: `url(${item.screenshots?.[0]})` }"
          >
            <div class="overlay" />
            <div
              class="entry-content absolute inset-y-0 z-10 flex w-full flex-col justify-end"
            >
              <div
                class="text flex w-full items-center justify-between border-t border-black/10 bg-white/100 p-4 font-bold"
                @click.stop
              >
                <div class="flex space-x-3">
                  <div v-if="item.icon" class="mt-0.5 w-6">
                    <img
                      :src="item.icon"
                      :alt="`${item.name} Logo`"
                      class="logo rounded-md"
                    />
                  </div>
                  <div>
                    <h3 class="title font-bold">{{ item.name }}</h3>
                    <div v-if="item.authorName" class="text-xs text-slate-400">
                      <div class="author">by {{ item.authorName }}</div>
                    </div>
                  </div>
                </div>
                <div class="action text-sm">
                  <router-link
                    btn="primary"
                    :to="`/showcase/${encodeURIComponent(
                      item.permalink || '',
                    )}`"
                    class="text-primary-500"
                  >
                    View &rarr;
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { vueRouter } from "@factor/api"
import { map as showcase } from "./map"
const router = vueRouter.useRouter()

const goToPermalink = async (permalink?: string): Promise<void> => {
  if (!permalink) return

  const path = `/showcase/${encodeURIComponent(permalink || "")}`

  await router.push({ path })
}
</script>
