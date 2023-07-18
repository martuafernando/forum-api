const NewThreadComment = require('../../Domains/threadComments/entities/NewThreadComment');

class AddThreadCommentUseCase {
  constructor({ threadCommentRepository }) {
    this._threadCommentRepository = threadCommentRepository;
  }

  async execute(useCasePayload) {
    const newThread = new NewThreadComment(useCasePayload);
    return this._threadCommentRepository.create(newThread);
  }
}

module.exports = AddThreadCommentUseCase;
