import { ObjectId } from "mongodb";

import { PorterStemmer, SentimentAnalyzer, WordTokenizer } from "natural";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface CommentDoc extends BaseDoc {
  author: ObjectId;
  content: string;
  parent: ObjectId;
}

const ANALYZER = new SentimentAnalyzer("English", PorterStemmer, "afinn");
const TOKENIZER = new WordTokenizer();

/**
 * concept: Commenting [Author, Parent]
 */
export default class CommentingConcept {
  public readonly comments: DocCollection<CommentDoc>;

  /**
   * Make an instance of Commenting.
   */
  constructor(collectionName: string) {
    this.comments = new DocCollection<CommentDoc>(collectionName);
  }

  async create(author: ObjectId, content: string, parent: ObjectId) {
    const _id = await this.comments.createOne({ author, content, parent });
    return { msg: "Comment successfully created!", comment: await this.comments.readOne({ _id }) };
  }

  async getComments() {
    // Returns all comments! You might want to page for better client performance
    return await this.comments.readMany({}, { sort: { _id: -1 } });
  }

  async getByAuthor(author: ObjectId) {
    return await this.comments.readMany({ author }, { sort: { _id: -1 } });
  }

  async getByParent(parent: ObjectId) {
    return await this.comments.readMany({ parent }, { sort: { _id: -1 } });
  }

  async getById(_id: ObjectId) {
    return await this.comments.readOne({ _id });
  }

  async getSentiment(content: string) {
    const tokens = TOKENIZER.tokenize(content);
    return ANALYZER.getSentiment(tokens);
  }

  async delete(_id: ObjectId) {
    await this.comments.deleteOne({ _id });
    return { msg: "Comment deleted successfully!" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const comment = await this.comments.readOne({ _id });
    if (!comment) {
      throw new NotFoundError(`Comment ${_id} does not exist!`);
    }
    if (comment.author.toString() !== user.toString()) {
      throw new CommentAuthorNotMatchError(user, _id);
    }
  }

  async assertCommentExists(_id: ObjectId) {
    if (!(await this.comments.readOne({ _id }))) {
      throw new NotFoundError(`Comment ${_id} does not exist!`);
    }
  }
}

export class CommentAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of comment {1}!", author, _id);
  }
}
