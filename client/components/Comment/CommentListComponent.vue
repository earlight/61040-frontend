<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import CommentComponent from "./CommentComponent.vue";
import CreateCommentForm from "./CreateCommentForm.vue";

const props = defineProps(["parent"]);
const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let comments = ref<Array<Record<string, string>>>([]);

async function getCommentsByParent(parent: string) {
  let query: Record<string, string> = { parent };
  let commentResults;
  try {
    commentResults = await fetchy("/api/comments/parent", "GET", { query });
  } catch (_) {
    return;
  }
  comments.value = commentResults;
}

onBeforeMount(async () => {
  await getCommentsByParent(props.parent._id);
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <CreateCommentForm :parent="props.parent" @refreshComments="getCommentsByParent(props.parent._id)" />
  </section>
  <section class="comments" v-if="loaded && comments.length !== 0">
    <article v-for="comment in comments" :key="comment._id">
      <CommentComponent :comment="comment" @refreshComments="getCommentsByParent(props.parent._id)" />
    </article>
  </section>
  <p v-else-if="loaded">No comments yet</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding-bottom: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
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

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
