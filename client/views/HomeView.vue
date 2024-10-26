<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const followSwitch = ref(false);
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <div style="text-align: center; margin: 1em 0">
      <button :class="{ active: !followSwitch }" @click="followSwitch = false">All</button>
      <button :class="{ active: followSwitch }" @click="followSwitch = true">Following</button>
    </div>
    <PostListComponent :mode="followSwitch ? 'following' : 'all'" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

button {
  padding: 0.5em 1em;
  margin: 0 0.5em;
  font-size: 1em;
  border: none;
  cursor: pointer;
  background-color: #ddd;
  color: #333;
  transition: background-color 0.3s;
}

button.active {
  background-color: #333;
  color: white;
}

button:hover:not(.active) {
  background-color: #ccc;
}
</style>
