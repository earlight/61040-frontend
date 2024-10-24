<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const { isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["item"]);
const types = ["like", "dislike"];

const loaded = ref(false);
const likes = ref<number | null>(null);
const liked = ref<boolean | null>(null);
const dislikes = ref<number | null>(null);
const disliked = ref<boolean | null>(null);

const getLikes = async () => {
  try {
    const results = await fetchy(`/api/reactions/item`, "GET", {
      query: { type: "like", item: props.item._id },
    });
    likes.value = results.length;
  } catch (_) {
    return;
  }
};

const getDislikes = async () => {
  try {
    const results = await fetchy(`/api/reactions/item`, "GET", {
      query: { type: "dislike", item: props.item._id },
    });
    dislikes.value = results.length;
  } catch (_) {
    return;
  }
};

const getReactionStatus = async () => {
  try {
    const result = await fetchy(`/api/reactions/my`, "GET", {
      query: { item: props.item._id },
      alert: false,
    });

    if (result.type === "like") {
      liked.value = true;
      disliked.value = false;
    } else if (result.type === "dislike") {
      liked.value = false;
      disliked.value = true;
    }
  } catch (_) {
    liked.value = false;
    disliked.value = false;
  }
};

const getReactions = async () => {
  await getLikes();
  await getDislikes();
  await getReactionStatus();
  console.log("Item: " + props.item._id);
  console.log("Likes: " + likes.value);
  console.log("Dislikes: " + dislikes.value);
  console.log("Liked: " + liked.value);
  console.log("Disliked: " + disliked.value);
};

const postReaction = async (type: "like" | "dislike") => {
  try {
    await fetchy(`/api/reactions`, "POST", {
      body: { type, item: props.item._id },
      alert: false,
    });
  } catch {
    return;
  }
};

const updateReaction = async (type: "like" | "dislike") => {
  try {
    await fetchy(`/api/reactions`, "PATCH", {
      body: { type, item: props.item._id },
      alert: false,
    });
  } catch {
    return;
  }
};

const deleteReaction = async () => {
  try {
    await fetchy(`/api/reactions/${props.item._id}`, "DELETE", {
      alert: false,
    });
  } catch {
    return;
  }
};

const react = async (type: "like" | "dislike") => {
  if (type === "like" && !liked.value) {
    // Like the item
    liked.value = true;
    likes.value = likes.value === null ? 0 : likes.value + 1;
    if (!disliked.value) {
      await postReaction("like");
    } else {
      disliked.value = false;
      dislikes.value = dislikes.value === null ? 0 : dislikes.value - 1;
      await updateReaction("like");
    }
  } else if (type === "like" && liked.value) {
    // Un-like the item
    liked.value = false;
    likes.value = likes.value === null ? 0 : likes.value - 1;
    await deleteReaction();
  } else if (type === "dislike" && !disliked.value) {
    // Dislike the item
    disliked.value = true;
    dislikes.value = dislikes.value === null ? 0 : dislikes.value + 1;
    if (!liked.value) {
      await postReaction("dislike");
    } else {
      liked.value = false;
      likes.value = likes.value === null ? 0 : likes.value - 1;
      await updateReaction("dislike");
    }
  } else if (type === "dislike" && disliked.value) {
    // Un-dislike the item
    disliked.value = false;
    dislikes.value = dislikes.value === null ? 0 : dislikes.value - 1;
    await deleteReaction();
  }
  await getReactions();
};

onBeforeMount(async () => {
  await getReactions();
  loaded.value = true;
});
</script>

<template>
  <div v-if="loaded" class="reactions">
    <div class="reaction">
      <button v-if="isLoggedIn" class="btn-small pure-button" @click="react('like')">
        {{ liked ? "Un-like" : "Like" }}
      </button>
      <span>{{ likes }} like{{ likes === 1 ? "" : "s" }}</span>
    </div>
    <div class="reaction">
      <button v-if="isLoggedIn" class="btn-small pure-button" @click="react('dislike')">
        {{ disliked ? "Un-dislike" : "Dislike" }}
      </button>
      <span>{{ dislikes }} dislike{{ dislikes === 1 ? "" : "s" }}</span>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>
