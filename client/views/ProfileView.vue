<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, onBeforeUpdate, ref } from "vue";
import { useRoute } from "vue-router";

const currentRoute = useRoute();

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

onBeforeMount(async () => {
  await getUser(currentRoute.params.username);
  loaded.value = true;
});

onBeforeUpdate(async () => {
  if (user.value && currentRoute.params.username !== user.value.username) {
    loaded.value = false;
    await getUser(currentRoute.params.username);
    loaded.value = true;
  }
});
</script>

<template>
  <div v-if="loaded && user">
    <section>
      <h1>Profile of {{ user.username }}</h1>
      <h2>{{ user.username }}'s posts:</h2>
    </section>
    <PostListComponent :profile="user.username" />
  </div>
  <div v-else-if="loaded && !user">
    <p>User not found.</p>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}
</style>
