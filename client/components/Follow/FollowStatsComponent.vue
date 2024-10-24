<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["user"]);

const loaded = ref(false);
const followers = ref<Array<Record<string, string>>>([]);
const following = ref<Array<Record<string, string>>>([]);

async function getFollowers() {
  const query: Record<string, string> = { username: props.user.username };
  let followersResults;
  try {
    followersResults = await fetchy("/api/followers", "GET", { query });
  } catch (_) {
    return;
  }
  followers.value = followersResults;
}

async function getFollowing() {
  const query: Record<string, string> = { username: props.user.username };
  let followingResults;
  try {
    followingResults = await fetchy("/api/following", "GET", { query });
  } catch (_) {
    return;
  }
  following.value = followingResults;
}

onBeforeMount(async () => {
  await getFollowers();
  await getFollowing();
  loaded.value = true;
});
</script>

<template>
  <div class="followers">
    <p>Followers: {{ followers.length }}</p>
    <p>Following: {{ following.length }}</p>
  </div>
</template>
