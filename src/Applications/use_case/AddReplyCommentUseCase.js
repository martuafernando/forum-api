const NewReplyComment = require('../../Domains/comments/entities/NewReplyComment')

class AddReplyCommentUseCase {
  constructor ({ replyCommentRepository }) {
    this._replyCommentRepository = replyCommentRepository
  }

  async execute (useCasePayload) {
    const newThreadComment = new NewReplyComment(useCasePayload)
    return this._replyCommentRepository.create({
      threadId: useCasePayload?.threadId,
      ...newThreadComment
    })
  }
}

module.exports = AddReplyCommentUseCase
