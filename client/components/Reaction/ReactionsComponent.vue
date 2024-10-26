<script setup lang="ts">
import router from "@/router";
import { useScoresStore } from "@/stores/scores";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const scoresStore = useScoresStore();
const { isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["item"]);

const loaded = ref(false);
const likes = ref<number | null>(null);
const liked = ref<boolean | null>(null);
const dislikes = ref<number | null>(null);
const disliked = ref<boolean | null>(null);

const isLikeHovered = ref(false);
const isDislikeHovered = ref(false);

const getLikes = async () => {
  try {
    const results = await fetchy(`/api/reactions/item`, "GET", {
      query: { type: "like", item: props.item._id },
      alert: false,
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
      alert: false,
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
  await scoresStore.updateScore(props.item._id);
};

async function viewLogin() {
  void router.push({ name: "Login" });
}

onBeforeMount(async () => {
  await getReactions();
  loaded.value = true;
});
</script>

<template>
  <div v-if="loaded" class="reactions">
    <div class="reaction" @mouseover="isLikeHovered = true" @mouseleave="isLikeHovered = false" @click="isLoggedIn ? react('like') : viewLogin()">
      <img v-if="liked" src="@/assets/images/like-fill.png" alt="Like" class="reaction-icon" />
      <img v-else-if="isLikeHovered" src="@/assets/images/like-hover.png" alt="Like" class="reaction-icon" />
      <img v-else src="@/assets/images/like-empty.png" alt="Like" class="reaction-icon" />
      <span :class="{ liked: liked }">{{ likes }}</span>
    </div>
    <div class="reaction" @mouseover="isDislikeHovered = true" @mouseleave="isDislikeHovered = false" @click="isLoggedIn ? react('dislike') : viewLogin()">
      <img v-if="disliked" src="@/assets/images/dislike-fill.png" alt="Dislike" class="reaction-icon" />
      <img v-else-if="isDislikeHovered" src="@/assets/images/dislike-hover.png" alt="Dislike" class="reaction-icon" />
      <img v-else src="@/assets/images/dislike-empty.png" alt="Dislike" class="reaction-icon" />
      <span :class="{ disliked: disliked }">{{ dislikes }}</span>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>

<style scoped>
/* Change color for like count */
.liked {
  color: #159d2f; /* Green color for likes */
}

/* Change color for dislike count */
.disliked {
  color: #a5211d; /* Red color for dislikes */
}

.reaction {
  padding: 5px; /* Add some padding for better visual space */
  border-radius: 4px; /* Optional: round the corners */
  cursor: pointer; /* Change cursor to pointer on hover */
  transition:
    color 0.3s,
    filter 0.3s,
    transform 0.3s; /* Smooth transition for color change */
}

.reaction:hover {
  transform: scale(1.1); /* Scale the icon on hover */
  filter: drop-shadow(0px 0px 5px #888888); /* Add a shadow on hover */
  transition:
    color 0.3s,
    filter 0.3s,
    transform 0.3s;
}

.reaction:active {
  transform: scale(0.95); /* Slight scaling on click */
}

/* Change color for like count */
.reaction:first-child:hover {
  color: #159d2f; /* Green color for likes */
}

/* Change color for dislike count */
.reaction:last-child:hover {
  color: #a5211d; /* Red color for dislikes */
}

.reaction-icon {
  width: 20px; /* Adjust the size as needed */
  height: 20px; /* Adjust the size as needed */
}
</style>
