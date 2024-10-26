<script setup lang="ts">
import FollowComponent from "@/components/Follow/FollowComponent.vue";
import FollowListComponent from "@/components/Follow/FollowListComponent.vue";
import ScoreComponent from "@/components/Score/ScoreComponent.vue";
import router from "@/router";
import { fetchy } from "@/utils/fetchy";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);

const loaded = ref(false);
const user = ref<Record<string, any> | null>(null);

const getUser = async (username: string | string[]) => {
  let result;
  try {
    result = await fetchy(`/api/users/${username}`, "GET", { alert: false });
  } catch (_) {
    user.value = null;
    return;
  }
  user.value = result;
};

async function viewBack() {
  void router.push({ name: "Profile", params: { username: currentRoute.params.username } });
}

onBeforeMount(async () => {
  await getUser(currentRoute.params.username);
  loaded.value = true;
});
</script>

<template>
  <div class="page-wrapper">
    <section>
      <div v-if="loaded && user">
        <div class="author-header">
          <h1>{{ currentRoute.params.username }}</h1>
          <FollowComponent :username="currentRoute.params.username" />
        </div>
        <ScoreComponent :item="currentRoute.params.username" :type="'User'" />
        <div class="button clickable-text" @click="viewBack">{{ "Back to " + currentRoute.params.username + "'s profile" }}</div>
        <h2>{{ currentRouteName }}</h2>
        <FollowListComponent :username="currentRoute.params.username" :mode="currentRouteName" />
      </div>
      <div v-else-if="loaded && !user">
        <p>User not found.</p>
      </div>
      <div v-else>
        <p>Loading...</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

.author-header {
  display: flex; /* Set to flex for row layout */
  align-items: center; /* Align items vertically */
  gap: 1em; /* Optional: Add space between profile header and follow component */
}
</style>
