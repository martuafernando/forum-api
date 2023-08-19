class LikeReplyCommentUseCase {
  constructor ({
    threadRepository,
    threadCommentRepository,
    replyCommentRepository,
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
    await this._replyCommentRepository.findOneById(useCasePayload.replyId)

    const isLIked = await this._replyCommentRepository.isUserLiked(useCasePayload.userId, useCasePayload.replyId)
    switch (isLIked) {
      case true:
        return await this._replyCommentRepository.unlikeComment(useCasePayload.userId, useCasePayload.replyId)
      case false:
        return await this._replyCommentRepository.likeComment(useCasePayload.userId, useCasePayload.replyId)
    }
  }

  _validatePayload (payload) {
    const { commentId, replyId, userId, threadId } = payload

    if (!commentId || !replyId || !userId || !threadId) {
      throw new Error('LIKE_REPLY_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof commentId !== 'string' || typeof replyId !== 'string' || typeof userId !== 'string' || typeof threadId !== 'string') {
      throw new Error('LIKE_REPLY_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = LikeReplyCommentUseCase
