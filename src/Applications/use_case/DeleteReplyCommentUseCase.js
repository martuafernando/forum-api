class DeleteReplyCommentUseCase {
  constructor ({
    replyCommentRepository,
    threadCommentRepository,
    userRepository
  }) {
    this._threadCommentRepository = threadCommentRepository
    this._replyCommentRepository = replyCommentRepository
    this._userRepository = userRepository
  }

  async execute (useCasePayload) {
    this._validatePayload(useCasePayload)
    await this._userRepository.findOneById(useCasePayload.owner)
    await this._threadCommentRepository.findOneById(useCasePayload.commentId)
    return this._replyCommentRepository.remove(useCasePayload)
  }

  _validatePayload (payload) {
    const { commentId, id, owner } = payload

    if (!commentId || !id || !owner) {
      throw new Error('DELETE_REPLY_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof commentId !== 'string' || typeof id !== 'string' || typeof owner !== 'string') {
      throw new Error('DELETE_REPLY_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = DeleteReplyCommentUseCase
