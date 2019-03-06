const DEFAULT_STATE = {
  loginJwt: {}
}

const logInWithJWT = (state, action) => {

  let loginState = {}
  let isAuthenticated = false

  const id_token = action.payload.id_token
  const access_token = action.payload.access_token
  //TODO: expire token after the specified time
  const expires_in = action.payload.expires_in

  let time = new Date()
  const expiry = time.setSeconds(time.getSeconds() + parseInt(expires_in))

  if (id_token !== undefined && id_token !== state.loginJwt.id_token) {
    loginState['id_token'] = id_token

    if (access_token !== undefined && access_token !== state.loginJwt.access_token) {
      loginState['access_token'] = access_token

      if (expires_in !== undefined && expiry > new Date()) {
        isAuthenticated = true
      }
    }
  }

  if (isAuthenticated) {
    loginState = {loginJwt: {id_token: id_token, access_token: access_token, isAuthenticated: isAuthenticated}}
  } else {
    loginState = {loginJwt: {id_token: '', access_token: '', isAuthenticated: false}}
  }

  return loginState
}

const logOut = () => {
  return {loginJwt: {id_token: '', access_token: '', isAuthenticated: false}}
}

const authenticate = (state=DEFAULT_STATE, action) => {
  switch(action.type) {
    case 'LOG_IN':
      return logInWithJWT(state, action)
    case 'LOG_OUT':
      return logOut()
    default:
      return state
  }
}

export default authenticate