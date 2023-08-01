class DeleteReplyCommentUseCase {
  constructor ({
    threadRepository,
    replyCommentRepository,
    threadCommentRepository,
    userRepository
  }) {
    this._threadRepository = threadRepository
    this._threadCommentRepository = threadCommentRepository
    this._replyCommentRepository = replyCommentRepository
    this._userRepository = userRepository
  }

  async execute (useCasePayload) {
    this._validatePayload(useCasePayload)
    await this._userRepository.findOneById(useCasePayload.userId)
    await this._threadRepository.findOneById(useCasePayload.threadId)
    await this._threadCommentRepository.findOneById(useCasePayload.commentId)

    const savedComment = await this._replyCommentRepository.findOneById(useCasePayload.id)
    await this._replyCommentRepository.verifyOwner(savedComment, useCasePayload.userId)

    return this._replyCommentRepository.remove(useCasePayload.id)
  }

  _validatePayload (payload) {
    const { commentId, id, userId, threadId } = payload

    if (!commentId || !id || !userId || !threadId) {
      throw new Error('DELETE_REPLY_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof commentId !== 'string' || typeof id !== 'string' || typeof userId !== 'string' || typeof threadId !== 'string') {
      throw new Error('DELETE_REPLY_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = DeleteReplyCommentUseCase
