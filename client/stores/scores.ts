import { fetchy } from "@/utils/fetchy";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useScoresStore = defineStore(
  "scores",
  () => {
    const MIN_SCORE = 0;
    const MAX_SCORE = 1.0;
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
        const commentSentiment = await computeCommentSentiment(comment.content);
        commentScore += commentSentiment;
      }
      commentScore = commentScore / totalComments;
      return commentScore;
    };

    const computeCommentSentiment = async (content: string) => {
      let sentimentScore = DEFAULT_SCORE;
      try {
        sentimentScore = await fetchy("/api/comments/sentiment", "GET", { query: { content } });
      } catch (_) {
        return DEFAULT_SCORE;
      }
      // bound sentiment score from [-5, 5] to [-1, 1]
      sentimentScore = Math.max(-1.0, Math.min(1.0, sentimentScore));

      // rescale sentiment score from [-1, 1] to [0, 1]
      sentimentScore = (sentimentScore + 1) / 2;

      return sentimentScore;
    };

    const updateContentScore = async (item: string) => {
      const reactionScore = await computeReactionScore(item);

      const commentScore = await computeCommentScore(item);

      let weightedScore = (reactionScore + commentScore) / 2;
      weightedScore = Math.max(MIN_SCORE, Math.min(MAX_SCORE, weightedScore));

      const score = Math.round(100 * weightedScore);

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
