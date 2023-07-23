class NewComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.content = payload.content;
    this.owner = payload.owner;
    this.target = payload.target;
  }

  _verifyPayload({ content, owner, target }) {
    if (!content || !owner || !target) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    
    if (typeof content !== 'string' || typeof owner !== 'string' || typeof target !== 'string') {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;
