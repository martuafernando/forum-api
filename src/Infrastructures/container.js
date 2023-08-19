/* istanbul ignore file */

const { createContainer } = require('instances-container')

// external agency
const { nanoid } = require('nanoid')
const bcrypt = require('bcrypt')
const Jwt = require('@hapi/jwt')
const pool = require('./database/postgres/pool')

// service (repository, helper, manager, etc)
const UserRepository = require('../Domains/users/UserRepository')
const PasswordHash = require('../Applications/security/PasswordHash')
const UserRepositoryPostgres = require('./repository/UserRepositoryPostgres')
const BcryptPasswordHash = require('./security/BcryptPasswordHash')
const ThreadRepository = require('../Domains/threads/ThreadRepository')
const ThreadRepositoryPostgres = require('./repository/ThreadRepositoryPostgres')

// use case
const AddUserUseCase = require('../Applications/use_case/AddUserUseCase')
const AuthenticationTokenManager = require('../Applications/security/AuthenticationTokenManager')
const JwtTokenManager = require('./security/JwtTokenManager')
const LoginUserUseCase = require('../Applications/use_case/LoginUserUseCase')
const AuthenticationRepository = require('../Domains/authentications/AuthenticationRepository')
const AuthenticationRepositoryPostgres = require('./repository/AuthenticationRepositoryPostgres')
const LogoutUserUseCase = require('../Applications/use_case/LogoutUserUseCase')
const RefreshAuthenticationUseCase = require('../Applications/use_case/RefreshAuthenticationUseCase')
const ThreadCommentRepository = require('../Domains/comments/ThreadCommentRepository')
const ReplyCommentRepository = require('../Domains/comments/ReplyCommentRepository')
const ThreadCommentRepositoryPostgres = require('./repository/ThreadCommentRepositoryPostgres')
const ReplyCommentRepositoryPostgres = require('./repository/ReplyCommentRepositoryPostgres')
const AddThreadUseCase = require('../Applications/use_case/AddThreadUseCase')
const AddThreadCommentUseCase = require('../Applications/use_case/AddThreadCommentUseCase')
const DeleteThreadCommentUseCase = require('../Applications/use_case/DeleteThreadCommentUseCase')
const DeleteReplyCommentUseCase = require('../Applications/use_case/DeleteReplyCommentUseCase')
const GetDetailThreadUseCase = require('../Applications/use_case/GetDetailThreadUseCase')
const AddReplyCommentUseCase = require('../Applications/use_case/AddReplyCommentUseCase')
const LikeAndUnlikeThreadCommentUseCase = require('../Applications/use_case/LikeAndUnlikeThreadCommentUseCase')
const LikeReplyCommentUseCase = require('../Applications/use_case/LikeAndUnlikeReplyCommentUseCase')

// creating container
const container = createContainer()

// registering services and repository
container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool
        },
        {
          concrete: nanoid
        }
      ]
    }
  },
  {
    key: AuthenticationRepository.name,
    Class: AuthenticationRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool
        }
      ]
    }
  },
  {
    key: ThreadRepository.name,
    Class: ThreadRepositoryPostgres,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'pool',
          concrete: pool
        },
        {
          name: 'idGenerator',
          concrete: nanoid
        },
        {
          name: 'userRepository',
          internal: UserRepository.name
        }
      ]
    }
  },
  {
    key: ThreadCommentRepository.name,
    Class: ThreadCommentRepositoryPostgres,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'pool',
          concrete: pool
        },
        {
          name: 'idGenerator',
          concrete: nanoid
        },
        {
          name: 'userRepository',
          internal: UserRepository.name
        },
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        }
      ]
    }
  },
  {
    key: ReplyCommentRepository.name,
    Class: ReplyCommentRepositoryPostgres,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'pool',
          concrete: pool
        },
        {
          name: 'idGenerator',
          concrete: nanoid
        },
        {
          name: 'userRepository',
          internal: UserRepository.name
        },
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        },
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name
        }
      ]
    }
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        {
          concrete: bcrypt
        }
      ]
    }
  },
  {
    key: AuthenticationTokenManager.name,
    Class: JwtTokenManager,
    parameter: {
      dependencies: [
        {
          concrete: Jwt.token
        }
      ]
    }
  }
])

// registering use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name
        },
        {
          name: 'passwordHash',
          internal: PasswordHash.name
        }
      ]
    }
  },
  {
    key: LoginUserUseCase.name,
    Class: LoginUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name
        },
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name
        },
        {
          name: 'authenticationTokenManager',
          internal: AuthenticationTokenManager.name
        },
        {
          name: 'passwordHash',
          internal: PasswordHash.name
        }
      ]
    }
  },
  {
    key: LogoutUserUseCase.name,
    Class: LogoutUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name
        }
      ]
    }
  },
  {
    key: RefreshAuthenticationUseCase.name,
    Class: RefreshAuthenticationUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name
        },
        {
          name: 'authenticationTokenManager',
          internal: AuthenticationTokenManager.name
        }
      ]
    }
  },
  {
    key: AddThreadUseCase.name,
    Class: AddThreadUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        },
        {
          name: 'userRepository',
          internal: UserRepository.name
        }
      ]
    }
  },
  {
    key: AddThreadCommentUseCase.name,
    Class: AddThreadCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        },
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name
        },
        {
          name: 'userRepository',
          internal: UserRepository.name
        }
      ]
    }
  },
  {
    key: AddReplyCommentUseCase.name,
    Class: AddReplyCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        },
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name
        },
        {
          name: 'replyCommentRepository',
          internal: ReplyCommentRepository.name
        },
        {
          name: 'userRepository',
          internal: UserRepository.name
        }
      ]
    }
  },
  {
    key: DeleteThreadCommentUseCase.name,
    Class: DeleteThreadCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        },
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name
        },
        {
          name: 'userRepository',
          internal: UserRepository.name
        }
      ]
    }
  },
  {
    key: DeleteReplyCommentUseCase.name,
    Class: DeleteReplyCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        },
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name
        },
        {
          name: 'replyCommentRepository',
          internal: ReplyCommentRepository.name
        },
        {
          name: 'userRepository',
          internal: UserRepository.name
        }
      ]
    }
  },
  {
    key: GetDetailThreadUseCase.name,
    Class: GetDetailThreadUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        },
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name
        },
        {
          name: 'replyCommentRepository',
          internal: ReplyCommentRepository.name
        },
        {
          name: 'userRepository',
          internal: UserRepository.name
        }
      ]
    }
  },
  {
    key: LikeAndUnlikeThreadCommentUseCase.name,
    Class: LikeAndUnlikeThreadCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        },
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name
        },
        {
          name: 'userRepository',
          internal: UserRepository.name
        }
      ]
    }
  }
])

module.exports = container
