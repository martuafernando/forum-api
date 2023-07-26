class GetDetailThreadUseCase {
  constructor ({
    threadRepository,
    commentRepository,
    userRepository
  }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
    this._userRepository = userRepository
  }

  async execute (useCasePayload) {
    this._verifyPayload(useCasePayload)
    const { id } = useCasePayload
    const thread = await this._threadRepository.findOneById(id)
    const user = await this._userRepository.findOneById(thread.owner)
    return await {
      ...thread,
      username: user.username,
      comments: await this.getComment(id)
    }
  }

  async getComment (id) {
    const comments = await this._commentRepository.findAllFromTarget(id)
    return await Promise.all(comments.map(async (comment) => {
      return {
        id: comment.id,
        username: (await this._userRepository.findOneById(comment.owner)).username,
        date: comment.date,
        content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
        replies: await this.getComment(comment.id)
      }
    }))
  }

  _verifyPayload (payload) {
    const { id } = payload

    if (!id) {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID')
    }

    if (typeof id !== 'string') {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = GetDetailThreadUseCase
