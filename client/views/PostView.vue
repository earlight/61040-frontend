<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import CommentListComponent from "../components/Comment/CommentListComponent.vue";
import PostComponent from "../components/Post/PostComponent.vue";
import { fetchy } from "../utils/fetchy";

const currentRoute = useRoute();

let loaded = ref(false);
let post = ref<Record<string, any> | null>(null);

async function getPost(id: string | string[]) {
  try {
    const result = await fetchy(`/api/posts/${id}`, "GET", { alert: false });
    post.value = result;
  } catch {
    return;
  }
}

onBeforeMount(async () => {
  await getPost(currentRoute.params.id);
  loaded.value = true;
});
</script>

<template>
  <section class="posts" v-if="loaded && post">
    <article>
      <PostComponent :post="post" />
    </article>
    <CommentListComponent :parent="post" />
  </section>
  <p v-else-if="loaded">Post not found.</p>
  <p v-else>Loading...</p>
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
  max-width: 60em;
}
</style>
