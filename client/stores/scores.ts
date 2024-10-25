import { fetchy } from "@/utils/fetchy";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useScoresStore = defineStore(
  "scores",
  () => {
    const scores = ref<Array<Record<string, string>>>([]);

    const getScores = async () => {
      try {
        const scoreResults = await fetchy("/api/score", "GET");
        scores.value = scoreResults;
      } catch (_) {
        return;
      }
    };

    const updateContentScore = async (item: string) => {
      let likesResults;
      let dislikesResults;
      try {
        likesResults = await fetchy(`/api/reactions/item`, "GET", {
          query: { type: "like", item: item },
        });
        dislikesResults = await fetchy(`/api/reactions/item`, "GET", {
          query: { type: "dislike", item: item },
        });
      } catch (_) {
        return;
      }
      const likes = likesResults.length;
      const dislikes = dislikesResults.length;
      const totalReactions = likes + dislikes;

      let reactionScore = 0.5;
      if (totalReactions !== 0) {
        reactionScore = (likes ?? 0) / totalReactions;
      }

      const commentScore = 0.5;

      const score = Math.round(100 * ((reactionScore + commentScore) / 2));

      console.log("likes: ", likes);
      console.log("dislikes: ", dislikes);
      console.log("totalReactions: ", totalReactions);
      console.log("reactionScore: ", reactionScore);
      console.log("commentScore: ", commentScore);
      console.log("score: ", score);

      try {
        await fetchy(`/api/score`, "PATCH", {
          body: { item, score: score.toString() },
          alert: false,
        });
      } catch (_) {
        return;
      }
    };

    return {
      scores,
      getScores,
      updateContentScore,
    };
  },
  { persist: true },
);
