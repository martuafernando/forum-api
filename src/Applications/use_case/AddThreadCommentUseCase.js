const NewThreadComment = require('../../Domains/comments/entities/NewThreadComment')

class AddThreadCommentUseCase {
  constructor ({ threadCommentRepository }) {
    this._threadCommentRepository = threadCommentRepository
  }

  async execute (useCasePayload) {
    const newThreadComment = new NewThreadComment(useCasePayload)
    return this._threadCommentRepository.create(newThreadComment)
  }
}

module.exports = AddThreadCommentUseCase
