async function signIn() {
  const redirect = true
  const callbackUrl = window.location.href
  const csrfToken = await getCSRFToken()
  const resp = await fetch('/api/auth/signin/github', {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({
      redirect,
      csrfToken,
      callbackUrl,
    }),
  })

  const data = await resp.clone().json()
  const error = new URL(data.url).searchParams.get('error')

  if (redirect || !isSupportingReturn || !error) {
    window.location.href = data.url ?? callbackUrl
    if (data.url.includes("#")) window.location.reload()
    return
  }

  return res
}

async function signOut() {
  const callbackUrl = window.location.href
  const csrfToken = await getCSRFToken()
  const resp = await fetch(`/api/auth/signout`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({
      csrfToken,
      callbackUrl: window.location.href,
    }),
  })
  const data = await resp.json()

  const url = data.url ?? callbackUrl
  window.location.href = url
  // If url contains a hash, the browser does not reload the page. We reload manually
  if (url.includes("#")) window.location.reload()
}

async function getCSRFToken() {
  const resp = await fetch('/api/auth/csrf')
  const { csrfToken } = await resp.json()
  return csrfToken
}

const signInBtn = document.querySelector('#sign-in')
const sessionDiv = document.querySelector('#session')

let isAuthenticated = false

signInBtn.addEventListener('click', () => {
  if (isAuthenticated) {
    signOut()
  } else {
    signIn()
  }
})

async function getSession() {
  const resp = await fetch('/api/auth/session')
  const session = await resp.json()
  
  if (!session || !Object.keys(session).length) {
    signInBtn.innerHTML = 'Sign in'
    isAuthenticated = false
    sessionDiv.innerHTML = ''
  } else {
    signInBtn.innerHTML = 'Sign out'
    isAuthenticated = true
    sessionDiv.innerHTML = `Session: ${JSON.stringify(session)}`
  }

  signInBtn.disabled = false
}

getSession()
