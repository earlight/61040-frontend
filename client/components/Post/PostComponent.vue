<script setup lang="ts">
import router from "@/router";
import { useScoresStore } from "@/stores/scores";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchy } from "../../utils/fetchy";
import FollowComponent from "../Follow/FollowComponent.vue";
import ReactionsComponent from "../Reaction/ReactionsComponent.vue";
import ScoreComponent from "../Score/ScoreComponent.vue";

const scoresStore = useScoresStore();
const { scores } = storeToRefs(useScoresStore());
const { goBackLink } = storeToRefs(useUserStore());
const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const props = defineProps(["post"]);
const emit = defineEmits(["refreshPosts", "reloadFollows"]);
const { currentUsername } = storeToRefs(useUserStore());

const loaded = ref(false);
const postScore = ref<string | null>(null);

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
  await scoresStore.updateScore(props.post._id);
  if (props.post._id == currentRoute.params.id) {
    void router.go(0);
  }
};

async function getScore() {
  for (const score of scores.value) {
    if (score.item == props.post._id) {
      postScore.value = score.score;
      return;
    }
  }
}

const borderClass = computed(() => {
  if (postScore.value !== null) {
    const score = Number(postScore.value);
    if (score < 50) return "border-red";
    if (score > 50) return "border-green";
    return "border-yellow";
  }
  return "border-yellow";
});

async function viewBack() {
  if (goBackLink.value == "Profile") {
    void router.push({ name: "Profile", params: { username: props.post.author } });
  } else {
    void router.push({ name: "Home" });
  }
}

async function viewComments() {
  if (currentRouteName.value == "Profile") {
    goBackLink.value = "Profile";
  } else {
    goBackLink.value = "Home";
  }
  void router.push({ name: "Post", params: { id: props.post._id } });
}

async function viewAuthor() {
  void router.push({ name: "Profile", params: { username: props.post.author } });
}

onBeforeMount(async () => {
  await scoresStore.getScores();
  await getScore();
  loaded.value = true;
});

watch(
  () => scores.value,
  async () => {
    await getScore();
  },
);
</script>

<template>
  <div :class="['outer', borderClass]" v-if="loaded">
    <p v-if="props.post._id == currentRoute.params.id" class="button clickable-text" @click="viewBack">
      {{ goBackLink == "Profile" ? "Back to " + props.post.author + "'s profile" : "Back to Home" }}
    </p>
    <div class="author-header">
      <p class="author" @click="viewAuthor">{{ props.post.author }}</p>
      <FollowComponent :username="props.post.author" @reloadFollows="emit('reloadFollows')" />
    </div>
    <p class="content">{{ props.post.content }}</p>
    <div class="subarticle">
      <div class="base">
        <div class="reactions">
          <ReactionsComponent :item="props.post" />
          <img v-if="props.post._id != currentRoute.params.id" src="/client/assets/images/comment.png" alt="Comment" class="button icon" @click="viewComments" />
        </div>
        <button v-if="props.post.author == currentUsername" class="button button-delete" @click="deletePost">Delete</button>
      </div>
      <div class="base">
        <ScoreComponent :item="props.post" :type="'Post'" />
        <article class="timestamp">Created on: {{ formatDate(props.post.dateCreated) }}</article>
      </div>
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.outer {
  border-radius: 20px; /* Rounded corners */
  padding-left: 1em;
  padding-right: 1em;
}

.author-header {
  gap: 1em;
  padding-top: 1em;
  padding-bottom: 1.5em;
}

.button {
  transition:
    background-color 0.3s,
    transform 0.3s,
    filter 0.3s,
    border-color 0.3s; /* Smooth transition for border color */
}
.button:hover {
  transform: scale(1.05); /* Slight scaling on hover */
  filter: drop-shadow(0px 0px 5px #888888); /* Add a shadow on hover */
  transition:
    filter 0.3s,
    transform 0.3s,
    background-color 0.3s,
    border-color 0.3s; /* Smooth transition for the shadow effect */
}
.button:active {
  transform: scale(0.95); /* Slight scaling on click */
}

.clickable-text {
  padding-top: 0.5em;
}
.clickable-text:hover {
  transform: scale(1);
}
.clickable-text:active {
  transform: scale(1);
}

.button-delete {
  background-color: #ff0000; /* Red */
  color: white; /* White text */
  border: 2px solid; /* Solid border */
  border-radius: 20px; /* Rounded corners */
  padding: 10px 20px; /* Comfortable padding */
  font-size: 16px; /* Font size */
}

.button-delete:hover {
  background-color: #dd0000; /* Darker red on hover */
}

.icon {
  width: 30px;
  height: 30px;
  padding: 0px;
}
</style>
