<script setup lang="ts">
import router from "@/router";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["username", "mode"]);

const loaded = ref(false);
const follows = ref<Array<Record<string, string>>>([]);

async function getFollows() {
  const query: Record<string, string> = { username: props.username };
  let followsResults;
  try {
    followsResults = await fetchy(`/api/${props.mode}`, "GET", { query, alert: false });
  } catch (_) {
    return;
  }

  follows.value = followsResults.filter((follow: { follower: any; followee: any }) => {
    const userToCheck = props.mode === "Followers" ? follow.follower : follow.followee;
    return userToCheck !== "DELETED_USER";
  });
}

async function viewUser(username: string) {
  void router.push({ name: "Profile", params: { username } });
}

onBeforeMount(async () => {
  await getFollows();
  loaded.value = true;
});
</script>

<template>
  <div v-if="loaded && follows.length !== 0">
    <div v-for="follow in follows" :key="follow._id">
      <span class="follow-item clickable-text button" @click="viewUser(props.mode === 'Followers' ? follow.follower : follow.followee)">{{
        props.mode === "Followers" ? follow.follower : follow.followee
      }}</span>
    </div>
  </div>
  <div v-else-if="loaded">
    <p v-if="props.mode === 'Followers'">No followers yet!</p>
    <p v-else>Not following anyone yet!</p>
  </div>
  <div v-else>Loading...</div>
</template>

<style scoped>
li {
  list-style-type: none;
}

.follow-item {
  display: inline-block;
  margin-bottom: 0.5em;
}
</style>
