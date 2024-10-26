<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn, currentUsername } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <header>
    <nav>
      <div class="title">
        <img src="@/assets/images/rely-icon.png" />
        <RouterLink :to="{ name: 'Home' }">
          <h1>Rely</h1>
        </RouterLink>
      </div>
      <ul>
        <li>
          <RouterLink :to="{ name: 'Home' }" :class="['menu-option', { bold: currentRouteName == 'Home' }]"> Home </RouterLink>
        </li>
        <li v-if="isLoggedIn">
          <RouterLink
            :to="{ name: 'Profile', params: { username: currentUsername } }"
            :class="['menu-option', { bold: currentRouteName == 'Profile' && currentRoute.params.username == currentUsername }]"
          >
            {{ currentUsername }}'s Profile
          </RouterLink>
        </li>
        <li v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Settings' }" :class="['menu-option', { bold: currentRouteName == 'Settings' }]"> Settings </RouterLink>
        </li>
        <li v-else>
          <RouterLink :to="{ name: 'Login' }" :class="['menu-option', { bold: currentRouteName == 'Login' }]"> Login </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <RouterView />
</template>

<style scoped>
@import "./assets/toast.css";

nav {
  padding: 1em 2em;
  background-color: #f1f3f5;
  display: flex;
  align-items: center;
  border-bottom: 4px solid #159d2f; /* Add green bottom border */
}

h1 {
  font-size: 2em;
  margin: 0;
}

.bold {
  font-weight: bold; /* Make the font bold */
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 4em;
}

a {
  font-size: large;
  color: black;
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

.underline {
  text-decoration: underline;
}

.menu-option {
  display: inline-block;
  cursor: pointer;
  transition:
    transform 0.3s,
    filter 0.3s;
}
.menu-option:hover {
  text-decoration: underline;
  transform: scale(1.05); /* Slight scaling on hover */
  filter: drop-shadow(0px 0px 5px #cccccc); /* Add a shadow on hover */
  transition:
    filter 0.3s,
    transform 0.3s;
}
.menu-option:active {
  transform: scale(0.95); /* Slight scaling on click */
}
</style>
