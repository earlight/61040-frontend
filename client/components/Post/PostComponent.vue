<script setup lang="ts">
import router from "@/router";
import { useScoresStore } from "@/stores/scores";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { fetchy } from "../../utils/fetchy";
import FollowComponent from "../Follow/FollowComponent.vue";
import ReactionsComponent from "../Reaction/ReactionsComponent.vue";
import ScoreComponent from "../Score/ScoreComponent.vue";

const scoresStore = useScoresStore();
const currentRoute = useRoute();
const props = defineProps(["post"]);
const emit = defineEmits(["refreshPosts", "reloadFollows"]);
const { currentUsername } = storeToRefs(useUserStore());

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

async function viewComments() {
  void router.push({ name: "Comments", params: { id: props.post._id } });
}

async function viewAuthor() {
  void router.push({ name: "Profile", params: { username: props.post.author } });
}
</script>

<template>
  <div class="author-header">
    <p class="author" @click="viewAuthor">{{ props.post.author }}</p>
    <ScoreComponent :item="props.post.author" :type="'User'" />
    <FollowComponent :username="props.post.author" @reloadFollows="emit('reloadFollows')" />
  </div>
  <p>{{ props.post.content }}</p>
  <div class="base">
    <ReactionsComponent :item="props.post" />
    <ScoreComponent :item="props.post" :type="'Post'" />
  </div>
  <div class="base">
    <menu>
      <button v-if="props.post._id != currentRoute.params.id" class="btn-small pure-button" @click="viewComments">View Comments & Reply</button>
      <button v-if="props.post.author == currentUsername" class="button-error btn-small pure-button" @click="deletePost">Delete</button>
    </menu>
    <article class="timestamp">Created on: {{ formatDate(props.post.dateCreated) }}</article>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.author-header {
  gap: 1em;
}
</style>
