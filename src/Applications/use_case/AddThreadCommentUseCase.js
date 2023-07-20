const NewComment = require('../../Domains/comments/entities/NewComment');

class AddThreadCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const newComment = new NewComment(useCasePayload);
    return this._commentRepository.createThreadComment(newComment);
  }
}

module.exports = AddThreadCommentUseCase;
