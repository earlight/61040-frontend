<script setup lang="ts">
import router from "@/router";
import { useScoresStore } from "@/stores/scores";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import FollowComponent from "../Follow/FollowComponent.vue";
import ReactionsComponent from "../Reaction/ReactionsComponent.vue";
import ScoreComponent from "../Score/ScoreComponent.vue";
import CommentListComponent from "./CommentListComponent.vue";

const scoresStore = useScoresStore();
const props = defineProps(["comment"]);
const emit = defineEmits(["refreshComments"]);
const { currentUsername } = storeToRefs(useUserStore());

const deleteComment = async () => {
  try {
    await fetchy(`/api/comments/${props.comment._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshComments");
  await scoresStore.updateScore(props.comment.parent);
};

async function viewAuthor() {
  void router.push({ name: "Profile", params: { username: props.comment.author } });
}
</script>

<template>
  <div class="author-header">
    <p class="author" @click="viewAuthor">{{ props.comment.author }}</p>
    <ScoreComponent :item="props.comment.author" :type="'User'" />
    <FollowComponent :username="props.comment.author" />
  </div>
  <p>{{ props.comment.content }}</p>
  <div class="base">
    <ReactionsComponent :item="props.comment" />
    <ScoreComponent :item="props.comment" :type="'Comment'" />
  </div>
  <div class="base">
    <menu>
      <button v-if="props.comment.author == currentUsername" class="button-error btn-small pure-button" @click="deleteComment">Delete</button>
    </menu>
    <article class="timestamp">Created on: {{ formatDate(props.comment.dateCreated) }}</article>
  </div>
  <CommentListComponent :parent="props.comment" />
</template>

<style scoped>
p {
  margin: 0em;
}

.author-header {
  gap: 1em;
}

.toggle-reply {
  margin: 1em 0;
}
</style>
