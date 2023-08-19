class LikeAndUnlikeThreadCommentUseCase {
  constructor ({
    threadRepository,
    threadCommentRepository,
    userRepository
  }) {
    this._threadRepository = threadRepository
    this._threadCommentRepository = threadCommentRepository
    this._userRepository = userRepository
  }

  async execute (useCasePayload) {
    this._validatePayload(useCasePayload)
    await this._userRepository.findOneById(useCasePayload.userId)
    await this._threadRepository.findOneById(useCasePayload.threadId)
    await this._threadCommentRepository.findOneById(useCasePayload.commentId)

    const isLIked = await this._threadCommentRepository.isUserLiked(useCasePayload.userId, useCasePayload.commentId)
    switch (isLIked) {
      case true:
        return await this._threadCommentRepository.unlikeComment(useCasePayload.userId, useCasePayload.commentId)
      case false:
        return await this._threadCommentRepository.likeComment(useCasePayload.userId, useCasePayload.commentId)
    }
  }

  _validatePayload (payload) {
    const { commentId, userId, threadId } = payload

    if (!commentId || !userId || !threadId) {
      throw new Error('LIKE_THREAD_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof commentId !== 'string' || typeof userId !== 'string' || typeof threadId !== 'string') {
      throw new Error('LIKE_THREAD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = LikeAndUnlikeThreadCommentUseCase
