const NewThreadComment = require('../../Domains/comments/entities/NewThreadComment')

class AddThreadCommentUseCase {
  constructor ({
    threadCommentRepository,
    userRepository,
    threadRepository
  }) {
    this._threadCommentRepository = threadCommentRepository
    this._userRepository = userRepository
    this._threadRepository = threadRepository
  }

  async execute (useCasePayload) {
    const newThreadComment = new NewThreadComment(useCasePayload)
    await this._threadRepository.findOneById(newThreadComment.threadId)
    await this._userRepository.findOneById(newThreadComment.owner)
    return this._threadCommentRepository.create(newThreadComment)
  }
}

module.exports = AddThreadCommentUseCase
