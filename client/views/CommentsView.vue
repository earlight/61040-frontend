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

onBeforeMount(async () => {
  await getPostOrComment(currentRoute.params.id);
  loaded.value = true;
});

onBeforeUpdate(async () => {
  if (parent.value && currentRoute.params.id !== parent.value._id) {
    loaded.value = false;
    await getPostOrComment(currentRoute.params.id);
    loaded.value = true;
  }
});
</script>

<template>
  <section class="posts" v-if="loaded && parent">
    <article v-if="isPost">
      <PostComponent :post="parent" />
    </article>
    <article v-else>
      <CommentComponent :comment="parent" />
    </article>
  </section>
  <p v-else-if="loaded">Post or comment not found.</p>
  <p v-else>Loading...</p>
  <div class="comments" v-if="loaded && parent" style="padding-bottom: 1em">
    <CommentListComponent :parent="parent" />
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
