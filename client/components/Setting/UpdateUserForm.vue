<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";

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
  <h2>Update user details</h2>

  <form @submit.prevent="updatePassword" class="pure-form">
    <fieldset>
      <legend>Change your password</legend>
      <input type="password" placeholder="Old password" v-model="currentPassword" required />
      <input type="password" placeholder="New password" v-model="newPassword" required />
      <button type="submit" class="pure-button pure-button-primary">Update password</button>
    </fieldset>
  </form>
</template>
