class NewThreadComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.content = payload.content;
    this.owner = payload.owner;
  }

  _verifyPayload({ content, owner }) {
    if (!content || !owner) {
      throw new Error('NEW_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    
    if (typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('NEW_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewThreadComment;
