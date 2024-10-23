<script setup lang="ts">
import { onBeforeMount, onUpdated, ref } from "vue";
import { useRoute } from "vue-router";
import CommentListComponent from "../components/Comment/CommentListComponent.vue";
import PostComponent from "../components/Post/PostComponent.vue";
import { fetchy } from "../utils/fetchy";

const currentRoute = useRoute();

let loaded = ref(false);
let parent = ref<Record<string, any> | null>(null);

async function getPostOrComment(id: string | string[]) {
  let result;
  try {
    result = await fetchy(`/api/posts/${id}`, "GET");
  } catch {
    try {
      result = await fetchy(`/api/comments/${id}`, "GET");
    } catch (_) {
      return;
    }
  }
  parent.value = result;
}

onBeforeMount(async () => {
  await getPostOrComment(currentRoute.params.id);
  loaded.value = true;
});

onUpdated(async () => {
  if (currentRoute.params.id !== parent.value?._id) {
    loaded.value = false;
    await getPostOrComment(currentRoute.params.id);
    loaded.value = true;
  }
});
</script>

<template>
  <section class="posts" v-if="loaded">
    <article>
      <PostComponent :post="parent" />
    </article>
  </section>
  <p v-else>Loading...</p>
  <div class="comments" v-if="loaded">
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
