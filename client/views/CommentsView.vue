<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import CommentListComponent from "../components/Comment/CommentListComponent.vue";
import PostComponent from "../components/Post/PostComponent.vue";
import { fetchy } from "../utils/fetchy";

const currentRoute = useRoute();

let loaded = ref(false);
let parent = ref<Record<string, any> | null>(null);

async function getPost(id: string | string[]) {
  let postResults;
  try {
    postResults = await fetchy(`/api/posts/${id}`, "GET");
  } catch (_) {
    return;
  }
  return postResults;
}

onBeforeMount(async () => {
  const post = await getPost(currentRoute.params.id);
  parent.value = post;
  loaded.value = true;
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

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.comments {
  margin-left: 2em;
}
</style>
