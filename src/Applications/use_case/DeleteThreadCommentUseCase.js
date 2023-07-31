class DeleteThreadCommentUseCase {
  constructor ({
    threadCommentRepository,
    userRepository
  }) {
    this._threadCommentRepository = threadCommentRepository
    this._userRepository = userRepository
  }

  async execute (useCasePayload) {
    this._validatePayload(useCasePayload)
    await this._userRepository.findOneById(useCasePayload.userId)
    return this._threadCommentRepository.remove(useCasePayload)
  }

  _validatePayload (payload) {
    const { threadId, id, userId } = payload

    if (!threadId || !id || !userId) {
      throw new Error('DELETE_THREAD_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof threadId !== 'string' || typeof id !== 'string' || typeof userId !== 'string') {
      throw new Error('DELETE_THREAD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = DeleteThreadCommentUseCase
