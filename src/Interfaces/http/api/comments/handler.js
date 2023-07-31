const AddReplyCommentUseCase = require('../../../../Applications/use_case/AddReplyCommentUseCase')
const AddThreadCommentUseCase = require('../../../../Applications/use_case/AddThreadCommentUseCase')
const DeleteThreadCommentUseCase = require('../../../../Applications/use_case/DeleteThreadCommentUseCase')
const DeleteReplyCommentUseCase = require('../../../../Applications/use_case/DeleteReplyCommentUseCase')
const AuthenticationTokenManager = require('../../../../Applications/security/AuthenticationTokenManager')

class ThreadsHandler {
  constructor (container) {
    this._container = container

    this.postThreadCommentsHandler = this.postThreadCommentsHandler.bind(this)
    this.deleteThreadCommentsHandler = this.deleteThreadCommentsHandler.bind(this)
    this.postRepliesCommentsHandler = this.postRepliesCommentsHandler.bind(this)
    this.deleteRepliesCommentsHandler = this.deleteRepliesCommentsHandler.bind(this)
  }

  async postThreadCommentsHandler (request, h) {
    const owner = await this._getCurrentUserFromAuthorizationToken(request)

    const { threadId } = request.params
    const addCommentThreadUseCase = this._container.getInstance(AddThreadCommentUseCase.name)
    const addedCommentThread = await addCommentThreadUseCase.execute({ threadId, owner, ...request.payload })

    const response = h.response({
      status: 'success',
      data: {
        addedComment: addedCommentThread
      }
    })
    response.code(201)
    return response
  }

  async deleteThreadCommentsHandler (request, h) {
    const userId = await this._getCurrentUserFromAuthorizationToken(request)

    const { threadId, commentId } = request.params
    const deleteThreadCommentUseCase = this._container.getInstance(DeleteThreadCommentUseCase.name)
    await deleteThreadCommentUseCase.execute({
      id: commentId,
      threadId,
      userId
    })

    const response = h.response({
      status: 'success'
    })
    response.code(200)
    return response
  }

  async postRepliesCommentsHandler (request, h) {
    const owner = await this._getCurrentUserFromAuthorizationToken(request)
    const { commentId, threadId } = request.params
    const addReplyCommentUseCase = this._container.getInstance(AddReplyCommentUseCase.name)
    const addedReply = await addReplyCommentUseCase.execute({
      owner,
      threadId,
      commentId,
      ...request.payload
    })

    const response = h.response({
      status: 'success',
      data: {
        addedReply
      }
    })
    response.code(201)
    return response
  }

  async deleteRepliesCommentsHandler (request, h) {
    const userId = await this._getCurrentUserFromAuthorizationToken(request)
    const { commentId, replyId: id } = request.params
    const deletereplyCommentUseCase = this._container.getInstance(DeleteReplyCommentUseCase.name)
    await deletereplyCommentUseCase.execute({
      id,
      commentId,
      userId
    })

    const response = h.response({
      status: 'success'
    })
    response.code(200)
    return response
  }

  async _getCurrentUserFromAuthorizationToken (request) {
    const accessToken = request.headers.authorization?.match(/(?<=Bearer ).+/)?.[0]
    if (!accessToken) throw Error('REQUEST.NOT_CONTAIN_ACCESS_TOKEN')
    const authenticationTokenManager = this._container.getInstance(AuthenticationTokenManager.name)
    const { id } = await authenticationTokenManager.decodePayload(accessToken)
    return id
  }
}

module.exports = ThreadsHandler
