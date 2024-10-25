import { fetchy } from "@/utils/fetchy";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useScoresStore = defineStore(
  "scores",
  () => {
    const DEFAULT_SCORE = 0.5;

    const scores = ref<Array<Record<string, string>>>([]);

    const getScores = async () => {
      try {
        const scoreResults = await fetchy("/api/score", "GET");
        scores.value = scoreResults;
      } catch (_) {
        return;
      }
    };

    const computeReactionScore = async (item: string) => {
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
        return DEFAULT_SCORE;
      }
      const likes = likesResults.length;
      const dislikes = dislikesResults.length;
      const totalReactions = likes + dislikes;

      let reactionScore = 0.5;
      if (totalReactions !== 0) {
        reactionScore = (likes ?? 0) / totalReactions;
      }
      console.log("reactionScore: ", reactionScore);
      return reactionScore;
    };

    const computeCommentScore = async (item: string) => {
      const query: Record<string, string> = { parent: item };
      let commentsResults;
      try {
        commentsResults = await fetchy(`/api/comments/parent`, "GET", { query });
      } catch (_) {
        return DEFAULT_SCORE;
      }
      const totalComments = commentsResults.length;
      if (totalComments === 0) {
        return DEFAULT_SCORE;
      }

      let commentScore = 0;
      for (const comment of commentsResults) {
        const commentSentiment = await computeCommentSentiment();
        console.log("comment: ", comment.content);
        commentScore += commentSentiment;
      }
      commentScore = commentScore / totalComments;
      console.log("commentScore: ", commentScore);
      return commentScore;
    };

    const computeCommentSentiment = async () => {
      console.log("HERE 1");
      try {
        await fetchy("/api/comments/sentiment", "GET", {});
        console.log("HERE 2 GOOD:");
      } catch (_) {
        console.log("HERE 2 BAD:", _);
        return DEFAULT_SCORE;
      }
      return 77;
    };

    const updateContentScore = async (item: string) => {
      const reactionScore = await computeReactionScore(item);

      const commentScore = await computeCommentScore(item);

      const score = Math.round(100 * ((reactionScore + commentScore) / 2));
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
