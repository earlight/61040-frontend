<script setup lang="ts">
import { useScoresStore } from "@/stores/scores";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";

const scoresStore = useScoresStore();
const { scores } = storeToRefs(useScoresStore());
const props = defineProps(["item"]);

const loaded = ref(false);
const itemScore = ref<string | null>(null);

const getParentScore = async () => {
  for (const score of scores.value) {
    if (score.item === props.item._id) {
      itemScore.value = score.score;
      return;
    }
  }
};

onBeforeMount(async () => {
  await scoresStore.getScores();
  await getParentScore();
  loaded.value = true;
});

watch(
  () => scores.value,
  async () => {
    await getParentScore();
  },
);
</script>

<template>
  <div v-if="loaded">
    <p>Rely score: {{ itemScore }}</p>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>
