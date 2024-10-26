<script setup lang="ts">
import router from "@/router";
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
    followersResults = await fetchy("/api/followers", "GET", { query, alert: false });
  } catch (_) {
    return;
  }

  followers.value = followersResults.filter((follow: { follower: any }) => {
    return follow.follower !== "DELETED_USER";
  });
}

async function getFollowing() {
  const query: Record<string, string> = { username: props.user.username };
  let followingResults;
  try {
    followingResults = await fetchy("/api/following", "GET", { query, alert: false });
  } catch (_) {
    return;
  }

  following.value = followingResults.filter((follow: { followee: any }) => {
    return follow.followee !== "DELETED_USER";
  });
}

async function viewFollowers() {
  void router.push({ name: "Followers", params: { username: props.user.username } });
}

async function viewFollowing() {
  void router.push({ name: "Following", params: { username: props.user.username } });
}

onBeforeMount(async () => {
  await getFollowers();
  await getFollowing();
  loaded.value = true;
});
</script>

<template>
  <div class="followers" v-if="loaded">
    <p class="clickable button" @click="viewFollowers">Followers: {{ followers.length }}</p>
    <p class="clickable button" @click="viewFollowing">Following: {{ following.length }}</p>
  </div>
  <div class="followers" v-else>
    <p>Loading...</p>
    <p></p>
  </div>
</template>

<style scoped></style>
