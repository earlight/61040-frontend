<script setup lang="ts">
import router from "@/router";
import { useScoresStore } from "@/stores/scores";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref, watch } from "vue";
import { fetchy } from "../../utils/fetchy";
import FollowComponent from "../Follow/FollowComponent.vue";
import ReactionsComponent from "../Reaction/ReactionsComponent.vue";
import ScoreComponent from "../Score/ScoreComponent.vue";
import CommentListComponent from "./CommentListComponent.vue";

const scoresStore = useScoresStore();
const { scores } = storeToRefs(useScoresStore());
const props = defineProps(["comment"]);
const emit = defineEmits(["refreshComments"]);
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
const reply = ref(false);
const commentScore = ref<string | null>(null);

const deleteComment = async () => {
  try {
    await fetchy(`/api/comments/${props.comment._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshComments");
  await scoresStore.updateScore(props.comment.parent);
};

async function getScore() {
  for (const score of scores.value) {
    if (score.item == props.comment._id) {
      commentScore.value = score.score;
      return;
    }
  }
}

const borderClass = computed(() => {
  if (commentScore.value !== null) {
    const score = Number(commentScore.value);
    if (score < 50) return "border-red";
    if (score > 50) return "border-green";
    return "border-yellow";
  }
  return "border-yellow";
});

async function toggleReply() {
  reply.value = !reply.value;
}

async function viewAuthor() {
  void router.push({ name: "Profile", params: { username: props.comment.author } });
}

onBeforeMount(async () => {
  await scoresStore.getScores();
  await getScore();
  loaded.value = true;
});

watch(
  () => scores.value,
  async () => {
    await getScore();
  },
);
</script>

<template>
  <div :class="['outer', borderClass]" v-if="loaded">
    <div class="author-header">
      <p class="author button" @click="viewAuthor">{{ props.comment.author }}</p>
      <FollowComponent :username="props.comment.author" />
    </div>
    <p>{{ props.comment.content }}</p>
    <div class="subarticle">
      <div class="base">
        <div class="reactions">
          <ReactionsComponent :item="props.comment" />
          <div class="toggle-reply button" v-if="isLoggedIn" @click="toggleReply">
            <img src="@/assets/images/comment.png" alt="Comment" class="icon" />
            <p>Reply</p>
          </div>
        </div>
        <button v-if="props.comment.author == currentUsername" class="button button-delete" @click="deleteComment">Delete</button>
      </div>
      <div class="base">
        <ScoreComponent :item="props.comment" :type="'Comment'" />
        <article class="timestamp">Created on: {{ formatDate(props.comment.dateCreated) }}</article>
      </div>
    </div>
  </div>
  <CommentListComponent :parent="props.comment" :reply="reply" @closeReply="reply = false" />
</template>

<style scoped>
p {
  margin: 0em;
}

.outer {
  border-radius: 20px; /* Rounded corners */
  padding-left: 1em;
  padding-right: 1em;
}

.author-header {
  gap: 1em;
  padding-top: 0.5em;
  padding-bottom: 1em;
}

.toggle-reply {
  margin-top: 0.25em;
  display: flex;
  align-items: center;
  gap: 0.25em;
  cursor: pointer;
}

.reactions {
  align-items: center;
}

.button-delete {
  background-color: #a5211d; /* Red */
  color: white; /* White text */
  border: 2px solid #a5211d; /* Red border */
  border-radius: 40px; /* Rounded corners */
  padding: 5px 20px; /* Comfortable padding */
}

.button-delete:hover {
  background-color: #841a17; /* Darker red */
  border: 2px solid #841a17; /* Darker red border */
}

.icon {
  width: 25px;
  height: 25px;
  padding: 0px;
}
</style>
