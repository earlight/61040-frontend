<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useScoresStore } from "@/stores/scores";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";
import SearchPostForm from "./SearchPostForm.vue";

const scoresStore = useScoresStore();
const { isLoggedIn, currentUsername, followSwitch } = storeToRefs(useUserStore());
const props = defineProps(["profile", "mode"]);

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let searchAuthor = ref("");

async function getFollows() {
  const query: Record<string, string> = { username: currentUsername.value };
  try {
    const followsResults = await fetchy(`/api/following`, "GET", { query, alert: false });
    return followsResults;
  } catch (_) {
    return;
  }
}

async function getPosts(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query, alert: author !== undefined });
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
  if (props.mode === "following" && isLoggedIn.value) {
    const follows = await getFollows();
    if (follows) {
      const followingPosts = postResults.filter((post: Record<string, string>) => {
        return follows.some((follow: Record<string, string>) => follow.followee === post.author);
      });
      postResults = followingPosts;
    }
  }
  posts.value = postResults;
}

async function reload() {
  await getPosts(props.profile ? props.profile : undefined);
}

onBeforeMount(async () => {
  await getPosts(props.profile ? props.profile : undefined);
  loaded.value = true;
});

watch(
  () => props.mode,
  async () => {
    loaded.value = false;
    await reload();
    loaded.value = true;
  },
);
</script>

<template>
  <section v-if="isLoggedIn && !props.profile">
    <CreatePostForm @refreshPosts="getPosts" />
  </section>
  <div class="row" v-if="!props.profile">
    <div class="column">
      <h2 v-if="!searchAuthor">Posts:</h2>
      <h2 v-else>Posts by {{ searchAuthor }}:</h2>
      <div class="mode" style="text-align: center; margin: 1em 0">
        <button v-if="isLoggedIn" :class="['button button-mode', { active: !followSwitch }]" @click="followSwitch = false">All</button>
        <button v-if="isLoggedIn" :class="['button button-mode', { active: followSwitch }]" @click="followSwitch = true">Following</button>
      </div>
    </div>
    <SearchPostForm @getPostsByAuthor="getPosts" />
  </div>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts" :key="post._id">
      <PostComponent :post="post" @refreshPosts="getPosts(props.profile ? props.profile : undefined)" @reloadFollows="reload" />
    </article>
  </section>
  <div v-else-if="loaded">
    <p v-if="props.mode === 'following'">No posts from users you follow.</p>
    <p v-else>No posts found.</p>
  </div>
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

.column {
  gap: 0em;
  align-items: start;
}

.button-mode {
  background-color: #ffffff; /* White background */
  color: black;
  border: 2px solid;
  border-radius: 40px; /* Rounded corners */
  padding: 10px 20px; /* Comfortable padding */
  cursor: pointer;
  margin-right: 1em;
}

.button-mode.active {
  background-color: #000000; /* Black background */
  color: white;
  border: 2px solid black;
}

.button-mode:hover.active {
  transform: none;
  filter: none;
  cursor: default;
}

.button-mode:hover:not(.active) {
  background-color: #dddddd;
}
</style>
