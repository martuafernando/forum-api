const NewReplyComment = require('../../Domains/comments/entities/NewReplyComment')

class AddReplyCommentUseCase {
  constructor ({
    replyCommentRepository,
    threadRepository,
    threadCommentRepository,
    userRepository
  }) {
    this._threadRepository = threadRepository
    this._threadCommentRepository = threadCommentRepository
    this._replyCommentRepository = replyCommentRepository
    this._userRepository = userRepository
  }

  async execute (useCasePayload) {
    const newThreadComment = new NewReplyComment(useCasePayload)
    await this._userRepository.findOneById(newThreadComment.owner)
    await this._threadRepository.findOneById(useCasePayload.threadId)
    await this._threadCommentRepository.findOneById(newThreadComment.commentId)
    return this._replyCommentRepository.create(newThreadComment)
  }
}

module.exports = AddReplyCommentUseCase
