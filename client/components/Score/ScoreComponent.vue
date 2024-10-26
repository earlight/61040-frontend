<script setup lang="ts">
import { useScoresStore } from "@/stores/scores";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";

const scoresStore = useScoresStore();
const { scores } = storeToRefs(useScoresStore());
const props = defineProps(["item", "type"]);

const loaded = ref(false);
const itemScore = ref<string | null>(null);
const id = ref<string | null>(null);

const getId = async () => {
  if (props.type === "User") {
    try {
      const userResult = await fetchy(`/api/users/${props.item}`, "GET");
      id.value = userResult._id;
    } catch (_) {
      return;
    }
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
    <p>{{ props.type }} Rely-ability: {{ itemScore }}%</p>
  </div>
  <div v-else-if="loaded">
    <p>N/A</p>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>
