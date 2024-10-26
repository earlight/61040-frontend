<script setup lang="ts">
import { useScoresStore } from "@/stores/scores";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref, watch } from "vue";

const scoresStore = useScoresStore();
const { scores } = storeToRefs(useScoresStore());
const props = defineProps(["item", "type"]);

const loaded = ref(false);
const itemScore = ref<string | null>(null);
const id = ref<string | null>(null);

const getId = async () => {
  if (props.type === "User") {
    id.value = await scoresStore.getUserId(props.item);
  } else {
    id.value = props.item._id;
  }
};

const getItemScore = async () => {
  //TODO: use find instead of for loop
  for (const score of scores.value) {
    if (score.item === id.value) {
      itemScore.value = score.score;
      return;
    }
  }
};

const borderClass = computed(() => {
  if (itemScore.value !== null) {
    const score = Number(itemScore.value);
    if (score < 50) return "border-red";
    if (score > 50) return "border-green";
    return "border-yellow";
  }
  return "border-yellow";
});

onBeforeMount(async () => {
  await scoresStore.getScores();
  await getId();
  await getItemScore();
  loaded.value = true;
});

watch(
  () => scores.value,
  async () => {
    await getItemScore();
  },
);
</script>

<template>
  <div v-if="loaded && itemScore !== null">
    <p :class="['reliability-score', borderClass]">{{ props.type }} Rely-ability: {{ itemScore }}%</p>
  </div>
  <div v-else-if="loaded">
    <p>N/A</p>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<style scoped>
.reliability-score {
  padding: 5px; /* Spacing inside the border */
  border-radius: 10px; /* Rounded corners */
  display: inline-block; /* Makes the border fit around the text */
  color: white; /* White text */
}

.border-green {
  border: 3px solid #159d2f; /* Green border */
  background-color: #159d2f; /* Green background */
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease; /* Smooth color change */
}
.border-red {
  border: 3px solid #a5211d; /* Red border */
  background-color: #a5211d; /* Red background */
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease; /* Smooth color change */
}
.border-yellow {
  border: 3px solid #aaa20b; /* Yellow border */
  background-color: #aaa20b; /* Yellow background */
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease; /* Smooth color change */
}
</style>
