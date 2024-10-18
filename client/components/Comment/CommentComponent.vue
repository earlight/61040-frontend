<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import CommentListComponent from "./CommentListComponent.vue";

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
};
</script>

<template>
  <p class="author">{{ props.comment.author }}</p>
  <p>{{ props.comment.content }}</p>
  <div class="base">
    <menu v-if="props.comment.author == currentUsername">
      <li><button class="button-error btn-small pure-button" @click="deleteComment">Delete</button></li>
    </menu>
    <article class="timestamp">Created on: {{ formatDate(props.comment.dateCreated) }}</article>
  </div>
  <div class="comments">
    <CommentListComponent :parent="props.comment" />
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}

.comments {
  margin-left: 2em;
}
</style>
