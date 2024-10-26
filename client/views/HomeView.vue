<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn, followSwitch } = storeToRefs(useUserStore());

async function viewTitle() {
  if (isLoggedIn.value) {
    void router.push({ name: "Profile", params: { username: currentUsername.value } });
  } else {
    void router.push({ name: "Login" });
  }
}
</script>

<template>
  <main>
    <section>
      <h1>
        <span class="button" @click="viewTitle">{{ isLoggedIn ? `Welcome ${currentUsername}!` : "Please login!" }}</span>
      </h1>
    </section>
    <PostListComponent :mode="followSwitch ? 'following' : 'all'" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

.button {
  display: inline-block;
}
.button:hover {
  text-decoration: underline;
}
</style>
