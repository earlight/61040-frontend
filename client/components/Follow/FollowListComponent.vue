<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["username", "mode"]);

const loaded = ref(false);
const follows = ref<Array<Record<string, string>>>([]);

async function getFollows() {
  const query: Record<string, string> = { username: props.username };
  let followsResults;
  try {
    followsResults = await fetchy(`/api/${props.mode}`, "GET", { query });
  } catch (_) {
    return;
  }
  follows.value = followsResults;
}

onBeforeMount(async () => {
  await getFollows();
  loaded.value = true;
});
</script>

<template>
  <div v-if="loaded && follows.length !== 0">
    <div v-for="follow in follows" :key="follow._id">
      <li>{{ props.mode === "Followers" ? follow.follower : follow.followee }}</li>
    </div>
  </div>
  <div v-else-if="loaded">
    <p v-if="props.mode === 'Followers'">No followers yet!</p>
    <p v-else>Not following anyone yet!</p>
  </div>
  <div v-else>Loading...</div>
</template>
