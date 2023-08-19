class GetDetailThreadUseCase {
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
    this._verifyPayload(useCasePayload)
    const { id } = useCasePayload
    const thread = await this._threadRepository.findOneById(id)
    const user = await this._userRepository.findOneById(thread.owner)
    return await {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: user.username,
      comments: await this.getComment(id)
    }
  }

  async getComment (id) {
    const comments = await this._threadCommentRepository.findAllFromThread(id)
    return comments.length > 0
      ? await Promise.all(comments.map(async (comment) => {
        return {
          id: comment.id,
          username: (await this._userRepository.findOneById(comment.owner)).username,
          date: comment.date,
          content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
          likeCount: comment.likeCount,
          replies: await this.getReplies(comment.id)
        }
      }))
      : []
  }

  async getReplies (id) {
    const comments = await this._replyCommentRepository.findAllFromComment(id)
    return comments.length > 0
      ? await Promise.all(comments.map(async (comment) => {
        return {
          id: comment.id,
          username: (await this._userRepository.findOneById(comment.owner)).username,
          date: comment.date,
          content: comment.is_deleted ? '**balasan telah dihapus**' : comment.content,
          likeCount: comment.likeCount,
          replies: await this.getReplies(comment.id)
        }
      }))
      : []
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
