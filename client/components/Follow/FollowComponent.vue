<script setup lang="ts">
import { useFollowsStore } from "@/stores/follows";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";

const followsStore = useFollowsStore();
const { follows } = storeToRefs(useFollowsStore());
const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());
const props = defineProps(["username"]);
const emit = defineEmits(["reloadFollows"]);

const loaded = ref(false);
const following = ref<boolean | null>(null);

const getFollowingStatus = async () => {
  for (const follow of follows.value) {
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
  await followsStore.getFollows();
  emit("reloadFollows");
};

onBeforeMount(async () => {
  await followsStore.getFollows();
  await getFollowingStatus();
  loaded.value = true;
});

watch(
  () => follows.value,
  async () => {
    await getFollowingStatus();
  },
);
</script>

<template>
  <div v-if="loaded && isLoggedIn && currentUsername !== props.username">
    <button :class="['button', following ? 'unfollow-button' : 'follow-button']" @click="toggleFollow">
      {{ following ? "Unfollow" : "Follow" }}
    </button>
  </div>
</template>

<style scoped>
.button {
  border-radius: 40px; /* Rounded corners */
  padding: 5px 20px; /* Comfortable padding */
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.3s,
    filter 0.3s,
    border-color 0.3s; /* Smooth transition for border color */
}
.button:hover {
  transform: scale(1.05); /* Slight scaling on hover */
  filter: drop-shadow(0px 0px 5px #cccccc); /* Add a shadow on hover */
  transition:
    filter 0.3s,
    transform 0.3s,
    background-color 0.3s,
    border-color 0.3s; /* Smooth transition for the shadow effect */
}
.button:active {
  transform: scale(0.95); /* Slight scaling on click */
}

.follow-button {
  background-color: #ffffff; /* White background */
  color: black;
  border: 2px solid;
}

.follow-button:hover {
  background-color: #dddddd;
}

.unfollow-button {
  background-color: #000000; /* Black background */
  color: white;
  border: 2px solid black;
}

.unfollow-button:hover {
  background-color: #333333;
  border: 2px solid #333333;
}
</style>
