<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { fetchy } from "../../utils/fetchy";
import ReactionsComponent from "../React/ReactionsComponent.vue";

const currentRoute = useRoute();
const props = defineProps(["post"]);
const emit = defineEmits(["refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
  if (props.post._id == currentRoute.params.id) {
    void router.go(0);
  }
};

async function viewComments() {
  void router.push({ name: "Comments", params: { id: props.post._id } });
}
</script>

<template>
  <p class="author">{{ props.post.author }}</p>
  <p>{{ props.post.content }}</p>
  <ReactionsComponent :item="props.post" />
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
</style>
