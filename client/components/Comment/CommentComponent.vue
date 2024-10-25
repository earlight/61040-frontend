<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { fetchy } from "../../utils/fetchy";
import FollowComponent from "../Follow/FollowComponent.vue";
import ReactionsComponent from "../Reaction/ReactionsComponent.vue";
import ContentScoreComponent from "../Score/ContentScoreComponent.vue";
import CommentListComponent from "./CommentListComponent.vue";

const currentRoute = useRoute();
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
  if (props.comment._id == currentRoute.params.id) {
    void router.go(0);
  }
};

async function viewComments() {
  void router.push({ name: "Comments", params: { id: props.comment._id } });
}

async function viewAuthor() {
  void router.push({ name: "Profile", params: { username: props.comment.author } });
}
</script>

<template>
  <menu>
    <p class="author" @click="viewAuthor">{{ props.comment.author }}</p>
    <FollowComponent :username="props.comment.author" />
  </menu>
  <p>{{ props.comment.content }}</p>
  <div class="base">
    <ReactionsComponent :item="props.comment" />
    <ContentScoreComponent :item="props.comment" />
  </div>
  <div class="base">
    <menu>
      <button v-if="props.comment._id != currentRoute.params.id" class="btn-small pure-button" @click="viewComments">View Comments & Reply</button>
      <button v-if="props.comment.author == currentUsername" class="button-error btn-small pure-button" @click="deleteComment">Delete</button>
    </menu>
    <article class="timestamp">Created on: {{ formatDate(props.comment.dateCreated) }}</article>
  </div>
  <div class="comments" v-if="props.comment._id != currentRoute.params.id">
    <CommentListComponent :parent="props.comment" />
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}
</style>
