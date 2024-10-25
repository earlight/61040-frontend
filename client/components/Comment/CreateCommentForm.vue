<script setup lang="ts">
import { useScoresStore } from "@/stores/scores";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const scoresStore = useScoresStore();
const props = defineProps(["parent"]);
const content = ref("");
const emit = defineEmits(["refreshComments"]);

const createComment = async (content: string) => {
  try {
    await fetchy("/api/comments", "POST", {
      body: { content, parent: props.parent._id },
    });
  } catch (_) {
    return;
  }
  emit("refreshComments");
  emptyForm();
  await scoresStore.updateContentScore(props.parent._id);
  await scoresStore.getScores();
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createComment(content)">
    <label for="content">Create a comment:</label>
    <textarea id="content" v-model="content" placeholder="Create a comment!" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Comment</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 3em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
