<script setup lang="ts">
import { onBeforeMount, onBeforeUpdate, ref } from "vue";
import { useRoute } from "vue-router";
import CommentComponent from "../components/Comment/CommentComponent.vue";
import CommentListComponent from "../components/Comment/CommentListComponent.vue";
import PostComponent from "../components/Post/PostComponent.vue";
import { fetchy } from "../utils/fetchy";

const currentRoute = useRoute();

let loaded = ref(false);
let parent = ref<Record<string, any> | null>(null);
let isPost = ref(false);
let follows = ref<Array<Record<string, string>>>([]);

async function getPostOrComment(id: string | string[]) {
  let result;
  try {
    result = await fetchy(`/api/posts/${id}`, "GET", { alert: false });
    isPost.value = true;
  } catch {
    try {
      result = await fetchy(`/api/comments/${id}`, "GET", { alert: false });
      isPost.value = false;
    } catch (_) {
      parent.value = null;
      return;
    }
  }
  parent.value = result;
}

async function getFollows() {
  let followResults;
  try {
    followResults = await fetchy("/api/follows", "GET");
  } catch (_) {
    return;
  }
  follows.value = followResults;
}

onBeforeMount(async () => {
  await getPostOrComment(currentRoute.params.id);
  await getFollows();
  loaded.value = true;
});

onBeforeUpdate(async () => {
  if (parent.value && currentRoute.params.id !== parent.value._id) {
    loaded.value = false;
    await getPostOrComment(currentRoute.params.id);
    await getFollows();
    loaded.value = true;
  }
});
</script>

<template>
  <section class="posts" v-if="loaded && parent">
    <article v-if="isPost">
      <PostComponent :post="parent" :follows="follows" @refreshFollows="getFollows" />
    </article>
    <article v-else>
      <CommentComponent :comment="parent" :follows="follows" @refreshFollows="getFollows" />
    </article>
  </section>
  <p v-else-if="loaded">Post or comment not found.</p>
  <p v-else>Loading...</p>
  <div class="comments" v-if="loaded && parent" style="padding-bottom: 1em">
    <CommentListComponent :parent="parent" :follows="follows" @refreshFollows="getFollows" />
  </div>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 80em;
}
</style>
