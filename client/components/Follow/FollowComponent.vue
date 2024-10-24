<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());
const props = defineProps(["username"]);

const loaded = ref(false);
const following = ref<boolean | null>(null);

const getFollowingStatus = async () => {
  const query: Record<string, string> = { username: currentUsername.value };
  console.log("HERE 1: ", query);
  let followingResults;
  try {
    followingResults = await fetchy("/api/following", "GET", { query });
    console.log("HERE 2: ", followingResults);
  } catch (_) {
    return;
  }

  for (const follow of followingResults) {
    if (follow.followee === props.username) {
      following.value = true;
      console.log("HERE 3 YES: ", following.value);
      return;
    }
  }
  following.value = false;
  console.log("HERE 3 NO: ", following.value);
};

const follow = async () => {
  try {
    await fetchy(`/api/follow`, "POST", {
      body: { username: props.username },
    });
    following.value = true;
  } catch (_) {
    return;
  }
};

const unfollow = async () => {
  try {
    await fetchy(`/api/follow/${props.username}`, "DELETE");
    following.value = false;
  } catch (_) {
    return;
  }
};

const toggleFollow = async () => {
  if (following.value === true) {
    await unfollow();
  } else if (following.value === false) {
    await follow();
  }
  await getFollowingStatus();
};

onBeforeMount(async () => {
  await getFollowingStatus();
  loaded.value = true;
});
</script>

<template>
  <div v-if="loaded && isLoggedIn && currentUsername !== props.username">
    <button class="btn-small pure-button" @click="toggleFollow">
      {{ following ? "Unfollow" : "Follow" }}
    </button>
  </div>
</template>
