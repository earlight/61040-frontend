<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";

const { logoutUser, deleteUser } = useUserStore();

async function logout() {
  await logoutUser();
  void router.push({ name: "Home" });
}

async function delete_() {
  await deleteUser();
  void router.push({ name: "Home" });
}
</script>

<template>
  <main class="column">
    <h1>Settings</h1>
    <button class="button logout" @click="logout">Logout</button>
    <button class="button delete-user" @click="delete_">Delete User</button>
    <UpdateUserForm />
  </main>
</template>

<style scoped>
.logout {
  background-color: #ffffff; /* White background */
  color: #000000; /* Black text color */
  border: 2px solid #000000; /* Black border */
  border-radius: 40px; /* Rounded corners */
  padding: 10px 20px; /* Comfortable padding */
}

.delete-user {
  background-color: #a5211d; /* Red */
  color: white; /* White text */
  border: 2px solid #a5211d; /* Red border */
  border-radius: 40px; /* Rounded corners */
  padding: 10px 20px; /* Comfortable padding */
}

.delete-user:hover {
  background-color: #841a17; /* Darker red */
  border: 2px solid #841a17; /* Darker red border */
}
</style>
