class SavedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.content = payload.content;
    this.date = payload.date;
    this.owner = payload.owner;
  }

  _verifyPayload({ id, content, date, owner }) {
    if (!id || !content || !date || !owner) {
      throw new Error('SAVED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    
    if (typeof id !== 'string' || typeof content !== 'string' || typeof date !== 'string' || typeof owner !== 'string') {
      throw new Error('SAVED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = SavedComment;
