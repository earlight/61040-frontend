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
        const scoreResults = await fetchy("/api/score", "GET", { alert: false });
        scores.value = scoreResults;
      } catch (_) {
        return;
      }
    };

    const getUserId = async (user: string) => {
      try {
        const userResult = await fetchy(`/api/users/${user}`, "GET", { alert: false });
        return userResult._id;
      } catch (_) {
        return;
      }
    };

    const getContentScore = async (id: string) => {
      const output = scores.value.find((score) => score.item === id)?.score ?? null;
      return output;
    };

    const getContentAuthor = async (id: string) => {
      let result;
      try {
        result = await fetchy(`/api/posts/${id}`, "GET", { alert: false });
      } catch {
        try {
          result = await fetchy(`/api/comments/${id}`, "GET", { alert: false });
        } catch (_) {
          return;
        }
      }
      return result.author;
    };

    const computeReactionScore = async (item: string, author: string) => {
      let likesResults;
      let dislikesResults;
      try {
        likesResults = await fetchy(`/api/reactions/item`, "GET", {
          query: { type: "like", item: item },
          alert: false,
        });
        dislikesResults = await fetchy(`/api/reactions/item`, "GET", {
          query: { type: "dislike", item: item },
          alert: false,
        });
      } catch (_) {
        return DEFAULT_SCORE;
      }

      let totalReactions = 0;
      let likes = 0;

      for (const reaction of likesResults) {
        if (reaction.author !== author) {
          totalReactions++;
          likes++;
        }
      }
      for (const reaction of dislikesResults) {
        if (reaction.author !== author) {
          totalReactions++;
        }
      }

      let reactionScore = DEFAULT_SCORE;
      if (totalReactions !== 0) {
        reactionScore = likes / totalReactions;
      }
      return reactionScore;
    };

    const computeCommentScore = async (item: string, author: string) => {
      const query: Record<string, string> = { parent: item };
      let commentsResults;
      try {
        commentsResults = await fetchy(`/api/comments/parent`, "GET", { query, alert: false });
      } catch (_) {
        return DEFAULT_SCORE;
      }

      let totalComments = 0;
      let totalCommentScore = 0;
      for (const comment of commentsResults) {
        if (comment.author !== author) {
          totalComments++;
          const commentSentiment = await computeCommentSentiment(comment.content);
          totalCommentScore += commentSentiment;
        }
      }

      let commentScore = DEFAULT_SCORE;
      if (totalComments !== 0) {
        commentScore = totalCommentScore / totalComments;
      }
      return commentScore;
    };

    const computeCommentSentiment = async (content: string) => {
      let sentimentScore = DEFAULT_SCORE;
      try {
        sentimentScore = await fetchy("/api/comments/sentiment", "GET", { query: { content }, alert: false });
      } catch (_) {
        return DEFAULT_SCORE;
      }
      // bound sentiment score from [-5, 5] to [-1, 1]
      sentimentScore = Math.max(-1.0, Math.min(1.0, sentimentScore));

      // rescale sentiment score from [-1, 1] to [0, 1]
      sentimentScore = (sentimentScore + 1) / 2;

      return sentimentScore;
    };

    const updateContentScore = async (item: string, author: string) => {
      const reactionScore = await computeReactionScore(item, author);
      const commentScore = await computeCommentScore(item, author);

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

    const computeUserScore = async (user: string) => {
      const query: Record<string, string> = { author: user };
      let postResults;
      try {
        postResults = await fetchy(`/api/posts`, "GET", { query, alert: false });
      } catch (_) {
        return;
      }

      let commentResults;
      try {
        commentResults = await fetchy(`/api/comments`, "GET", { query, alert: false });
      } catch (_) {
        return;
      }

      let totalContent = 0;
      let totalContentScore = 0;
      for (const post of postResults) {
        const contentScore = await getContentScore(post._id);
        if (contentScore !== null) {
          totalContent++;
          totalContentScore += Number(contentScore);
        }
      }
      for (const comment of commentResults) {
        const contentScore = await getContentScore(comment._id);
        if (contentScore !== null) {
          totalContent++;
          totalContentScore += Number(contentScore);
        }
      }

      let userScore = DEFAULT_SCORE;
      if (totalContent !== 0) {
        userScore = totalContentScore / totalContent;
      }
      userScore = Math.max(MIN_SCORE * 100, Math.min(MAX_SCORE * 100, userScore));
      userScore = Math.round(userScore);
      return userScore;
    };

    const updateUserScore = async (user: string, id: string) => {
      const userScore = await computeUserScore(user);
      if (userScore === undefined) {
        return;
      }

      try {
        await fetchy(`/api/score`, "PATCH", {
          body: { item: id, score: userScore.toString() },
          alert: false,
        });
      } catch (_) {
        return;
      }
    };

    const updateScore = async (item: string) => {
      const author = await getContentAuthor(item);
      const authorId = await getUserId(author);

      if (author === null || authorId === null) {
        return;
      }

      await updateContentScore(item, author);
      await getScores();
      await updateUserScore(author, authorId);
      await getScores();
    };

    return {
      scores,
      getUserId,
      getScores,
      updateScore,
    };
  },
  { persist: true },
);
