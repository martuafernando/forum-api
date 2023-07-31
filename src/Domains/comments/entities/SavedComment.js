/* eslint-disable camelcase */
class SavedComment {
  constructor (payload) {
    this._verifyPayload(payload)

    this.id = payload.id
    this.content = payload.content
    this.date = payload.date
    this.owner = payload.owner
    this.is_deleted = payload.is_deleted
  }

  _verifyPayload ({ id, content, date, owner, is_deleted }) {
    if (!id || !content || !date || !owner || (is_deleted === undefined)) {
      throw new Error('SAVED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (
      typeof id !== 'string' ||
      typeof content !== 'string' ||
      typeof date !== 'string' ||
      typeof owner !== 'string' ||
      typeof is_deleted !== 'boolean'
    ) {
      throw new Error('SAVED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = SavedComment
