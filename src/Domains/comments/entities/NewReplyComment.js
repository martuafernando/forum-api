class NewREplyComment {
  constructor (payload) {
    this._verifyPayload(payload)

    this.content = payload.content
    this.owner = payload.owner
    this.commentId = payload.commentId
  }

  _verifyPayload ({ content, owner, commentId }) {
    if (!content || !owner || !commentId) {
      throw new Error('NEW_REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof commentId !== 'string') {
      throw new Error('NEW_REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = NewREplyComment
