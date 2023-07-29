class NewThreadComment {
  constructor (payload) {
    this._verifyPayload(payload)

    this.content = payload.content
    this.owner = payload.owner
    this.threadId = payload.threadId
  }

  _verifyPayload ({ content, owner, threadId }) {
    if (!content || !owner || !threadId) {
      throw new Error('NEW_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string') {
      throw new Error('NEW_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = NewThreadComment
