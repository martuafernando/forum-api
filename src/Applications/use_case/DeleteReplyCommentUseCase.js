class DeleteReplyCommentUseCase {
  constructor ({
    replyCommentRepository
  }) {
    this._replyCommentRepository = replyCommentRepository
  }

  async execute (useCasePayload) {
    this._validatePayload(useCasePayload)
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
