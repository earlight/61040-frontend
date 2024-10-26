<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import CommentComponent from "./CommentComponent.vue";
import CreateCommentForm from "./CreateCommentForm.vue";

const currentRoute = useRoute();
const props = defineProps(["parent"]);
const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let comments = ref<Array<Record<string, string>>>([]);
const collapsed = ref(false);
const reply = ref(false);

async function getCommentsByParent(parent: string, stayCollapsed?: boolean) {
  let query: Record<string, string> = { parent };
  let commentResults;
  try {
    commentResults = await fetchy("/api/comments/parent", "GET", { query, alert: false });
  } catch (_) {
    return;
  }
  comments.value = commentResults;
  if (stayCollapsed) {
    return;
  }
  collapsed.value = false;
  reply.value = false;
}

const toggleComments = () => {
  collapsed.value = !collapsed.value;
};

const toggleReply = () => {
  reply.value = !reply.value;
};

onBeforeMount(async () => {
  await getCommentsByParent(props.parent._id);
  loaded.value = true;
});
</script>

<template>
  <div class="toggle-reply" v-if="isLoggedIn && props.parent._id !== currentRoute.params.id">
    <button @click="toggleReply">Reply to Comment</button>
  </div>
  <div class="comments">
    <section v-if="isLoggedIn && (props.parent._id === currentRoute.params.id || reply)" style="padding-bottom: 1em">
      <CreateCommentForm :parent="props.parent" @refreshComments="getCommentsByParent(props.parent._id)" />
    </section>
  </div>
  <div class="toggle-comments" v-if="props.parent._id !== currentRoute.params.id && comments.length !== 0">
    <button @click="toggleComments">{{ collapsed ? "Show Comments" : "Hide Comments" }}</button>
  </div>
  <div class="comments" v-if="!collapsed">
    <section v-if="loaded && comments.length !== 0">
      <article v-for="comment in comments" :key="comment._id">
        <CommentComponent :comment="comment" @refreshComments="getCommentsByParent(props.parent._id, true)" />
      </article>
    </section>
    <p v-else-if="loaded && props.parent._id === currentRoute.params.id">No comments yet.</p>
    <p v-else-if="!loaded">Loading...</p>
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

.toggle-comments {
  margin: 1em 0;
}
</style>
