const AddThreadCommentUseCase = require('../../../../Applications/use_case/AddThreadCommentUseCase')
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase')
class ThreadsHandler {
  constructor (container) {
    this._container = container

    this.postThreadCommentsHandler = this.postThreadCommentsHandler.bind(this)
    this.deleteThreadCommentsHandler = this.deleteThreadCommentsHandler.bind(this)
  }

  async postThreadCommentsHandler (request, h) {
    const accessToken = request.headers.authorization?.match(/(?<=Bearer ).+/)?.[0]
    const { threadId } = request.params
    const addCommentThreadUseCase = this._container.getInstance(AddThreadCommentUseCase.name)
    const addedCommentThread = await addCommentThreadUseCase.execute(accessToken, { target: threadId, ...request.payload })

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
    const accessToken = request.headers.authorization?.match(/(?<=Bearer ).+/)?.[0]
    const { threadId: target, commentId: id } = request.params
    const deleteThreadCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name)
    await deleteThreadCommentUseCase.execute(accessToken, {
      id,
      target
    })

    const response = h.response({
      status: 'success'
    })
    response.code(200)
    return response
  }
}

module.exports = ThreadsHandler
