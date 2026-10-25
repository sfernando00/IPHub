export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

const TOKEN_KEY = 'iphub_token'

export class AuthError extends Error {}

export async function login(credentials: LoginRequest, remember: boolean): Promise<LoginResponse> {
  let response: Response
  try {
    response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
  } catch {
    throw new AuthError("Can't reach the server. Check that the backend is running.")
  }

  if (response.status === 401) {
    throw new AuthError('Invalid username or password.')
  }
  if (response.status === 404) {
    throw new AuthError('The login service is not available yet.')
  }
  if (!response.ok) {
    throw new AuthError('Something went wrong. Please try again.')
  }

  const data = (await response.json()) as LoginResponse
  // "Remember me" keeps the token across browser restarts; otherwise it lasts for this tab only.
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, data.access_token)
  return data
}
