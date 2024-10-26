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
  await scoresStore.updateScore(props.parent._id);
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createComment(content)">
    <label for="content">Create a Rely comment:</label>
    <textarea id="content" v-model="content" placeholder="Reply with your Rely-able thoughts here!" required> </textarea>
    <button type="submit" class="submit button">Create Rely Comment</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  padding-left: 1em;
  padding-right: 1em;
  border-radius: 20px;
  border: 2px solid;
  resize: none;
  outline: none;
  border-color: #000000;
  transition:
    box-shadow 0.3s,
    border-color 0.3s; /* Smooth transition for border color */
}
textarea:focus {
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.5); /* Smooth outer glow effect */
  border-color: #007bff;
  transition:
    box-shadow 0.3s,
    border-color 0.3s; /* Smooth transition for the shadow effect */
}
.submit {
  background-color: #ffffff; /* White background */
  color: black;
  border: 2px solid; /* Solid border */
  border-radius: 40px; /* Rounded corners */
  padding: 5px 40px; /* Comfortable padding */
}

.submit:hover {
  transform: scale(1.025); /* Slight scaling on hover */
  background-color: #dddddd;
}

.submit:active {
  transform: scale(0.975); /* Slight scaling on click */
}
</style>
