const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const newComment = new NewComment(useCasePayload);
    return this._commentRepository.create(newComment);
  }
}

module.exports = AddCommentUseCase;
