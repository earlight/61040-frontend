<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const { currentUsername } = storeToRefs(useUserStore());
let currentPassword = ref("");
let newPassword = ref("");

const { updateUserPassword, updateSession } = useUserStore();

async function updatePassword() {
  await updateUserPassword(currentPassword.value, newPassword.value);
  await updateSession();
  currentPassword.value = newPassword.value = "";
}
</script>

<template>
  <h2>Logged in as {{ currentUsername }}</h2>
  <form @submit.prevent="updatePassword" class="pure-form">
    <fieldset>
      <legend>Change your password</legend>
      <input type="password" placeholder="Old password" v-model="currentPassword" required />
      <input type="password" placeholder="New password" v-model="newPassword" required />
      <button type="submit" class="button">Update password</button>
    </fieldset>
  </form>
</template>

<style scoped>
legend {
  border: none;
}

form {
  background-color: var(--base-bg);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

/* Style for the input */
input[type="password"] {
  padding: 0.5em;
  padding-left: 1em;
  padding-right: 1em;
  border-radius: 15px; /* Rounded corners */
  border: 2px solid #000000; /* Black border */
  font-size: 1em;
  resize: none;
  outline: none;
  margin-right: 0.5em;
  border-color: #000000; /* Black border */
  transition:
    box-shadow 0.3s,
    border-color 0.3s; /* Smooth transition for border color */
}

/* Focus effect for input */
input[type="password"]:focus {
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.5); /* Smooth outer glow effect */
  border-color: #007bff; /* Change color on focus */
  transition:
    box-shadow 0.3s,
    border-color 0.3s; /* Smooth transition for the shadow effect */
}

/* Style for the button */
button[type="submit"] {
  padding: 0.5em 1em;
  border-radius: 40px; /* Rounded corners */
  border: 2px solid #007bff; /* Thicker border */
  background-color: #007bff;
  color: white;
  font-size: 1em;
  cursor: pointer;
}

/* Hover effect for button */
button[type="submit"]:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

input:required:invalid {
  color: black;
}
</style>
