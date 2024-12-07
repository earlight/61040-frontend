<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import CommentComponent from "./CommentComponent.vue";
import CreateCommentForm from "./CreateCommentForm.vue";

const currentRoute = useRoute();
const props = defineProps(["parent", "reply"]);
const emit = defineEmits(["closeReply"]);
const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let comments = ref<Array<Record<string, string>>>([]);
const collapsed = ref(false);

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
  emit("closeReply");
}

const toggleComments = async () => {
  collapsed.value = !collapsed.value;
};

onBeforeMount(async () => {
  await getCommentsByParent(props.parent._id);
  loaded.value = true;
});
</script>

<template>
  <div class="comments" v-if="isLoggedIn && (props.parent._id === currentRoute.params.id || reply)">
    <section>
      <CreateCommentForm :parent="props.parent" @refreshComments="getCommentsByParent(props.parent._id)" />
    </section>
  </div>
  <button v-if="props.parent._id !== currentRoute.params.id && comments.length !== 0" class="button button-comment" @click="toggleComments">
    {{ collapsed ? "Show Comments" : "Collapse Comments" }}
  </button>
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
  padding-top: 1em;
  padding-bottom: 0em;
}

.button-comment {
  background-color: #ffffff; /* White background */
  color: black;
  border: 2px solid; /* Solid border */
  border-radius: 40px; /* Rounded corners */
  padding: 5px 40px; /* Comfortable padding */
  margin-bottom: 1em;
}

.button-comment:hover {
  transform: scale(1.025); /* Slight scaling on hover */
  background-color: #dddddd;
}

.button-comment:active {
  transform: scale(0.975); /* Slight scaling on click */
}
</style>
