<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";

const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());
const props = defineProps(["username", "follows"]);
const emits = defineEmits(["refreshFollows"]);

const loaded = ref(false);
const following = ref<boolean | null>(null);

const getFollowingStatus = async () => {
  for (const follow of props.follows) {
    if (follow.followee === props.username && follow.follower === currentUsername.value) {
      following.value = true;
      return;
    }
  }
  following.value = false;
};

const follow = async () => {
  try {
    await fetchy(`/api/follow`, "POST", {
      body: { username: props.username },
    });
  } catch (_) {
    return;
  }
};

const unfollow = async () => {
  try {
    await fetchy(`/api/follow/${props.username}`, "DELETE");
  } catch (_) {
    return;
  }
};

const toggleFollow = async () => {
  if (following.value === true) {
    following.value = false;
    await unfollow();
  } else if (following.value === false) {
    following.value = true;
    await follow();
  }
  emits("refreshFollows");
};

onBeforeMount(async () => {
  emits("refreshFollows");
  await getFollowingStatus();
  loaded.value = true;
});

watch(
  () => props.follows,
  async () => {
    await getFollowingStatus();
  },
);
</script>

<template>
  <div v-if="loaded && isLoggedIn && currentUsername !== props.username">
    <button class="btn-small pure-button" @click="toggleFollow">
      {{ following ? "Unfollow" : "Follow" }}
    </button>
  </div>
</template>
