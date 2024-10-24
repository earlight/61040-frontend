<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import CommentComponent from "./CommentComponent.vue";
import CreateCommentForm from "./CreateCommentForm.vue";

const currentRoute = useRoute();
const props = defineProps(["parent", "follows"]);
const emits = defineEmits(["refreshFollows"]);
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

async function getFollows() {
  emits("refreshFollows");
}

onBeforeMount(async () => {
  await getCommentsByParent(props.parent._id);
  emits("refreshFollows"); // TODO
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn && props.parent._id == currentRoute.params.id" style="padding-bottom: 1em">
    <CreateCommentForm :parent="props.parent" @refreshComments="getCommentsByParent(props.parent._id)" />
  </section>
  <section class="comments" v-if="loaded && comments.length !== 0">
    <article v-for="comment in comments" :key="comment._id">
      <CommentComponent :comment="comment" :follows="follows" @refreshComments="getCommentsByParent(props.parent._id)" @refreshFollows="getFollows" />
    </article>
  </section>
  <p v-else-if="loaded && props.parent._id == currentRoute.params.id">No comments yet.</p>
  <p v-else-if="!loaded">Loading...</p>
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

article {
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  padding-bottom: 0;
}
</style>
