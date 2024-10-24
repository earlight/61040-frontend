<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchPostForm from "./SearchPostForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["profile"]);

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let searchAuthor = ref("");
let follows = ref<Array<Record<string, string>>>([]);

async function getPosts(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
  posts.value = postResults;
}

async function getFollows() {
  let followResults;
  try {
    followResults = await fetchy("/api/follows", "GET");
  } catch (_) {
    return;
  }
  follows.value = followResults;
}

onBeforeMount(async () => {
  await getPosts(props.profile ? props.profile : undefined);
  await getFollows();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn && !props.profile">
    <h2>Create a post:</h2>
    <CreatePostForm @refreshPosts="getPosts" />
  </section>
  <div class="row" v-if="!props.profile">
    <h2 v-if="!searchAuthor">Posts:</h2>
    <h2 v-else>Posts by {{ searchAuthor }}:</h2>
    <SearchPostForm @getPostsByAuthor="getPosts" />
  </div>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts" :key="post._id">
      <PostComponent :post="post" :follows="follows" @refreshPosts="getPosts(props.profile ? props.profile : undefined)" @refreshFollows="getFollows" />
    </article>
  </section>
  <p v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}
</style>
