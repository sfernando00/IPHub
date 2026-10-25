export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  full_name: string
}

export interface RegisterRequest {
  full_name: string
  username: string
  email: string
  password: string
}

export interface RegisterResponse {
  username: string
}

const TOKEN_KEY = 'iphub_token'

export class AuthError extends Error {}

async function readDetail(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { detail?: unknown }
    return typeof body.detail === 'string' ? body.detail : null
  } catch {
    return null
  }
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new AuthError("Can't reach the server. Check that the backend is running.")
  }

  if (response.ok) return (await response.json()) as T

  const detail = await readDetail(response)
  switch (response.status) {
    case 401:
    case 409:
      throw new AuthError(detail ?? 'Request was rejected.')
    case 404:
      throw new AuthError('This service is not available yet.')
    case 422:
      throw new AuthError('Please check the details you entered.')
    default:
      throw new AuthError('Something went wrong. Please try again.')
  }
}

export async function login(credentials: LoginRequest, remember: boolean): Promise<LoginResponse> {
  const data = await postJson<LoginResponse>('/api/auth/login', credentials)
  // "Remember me" keeps the token across browser restarts; otherwise it lasts for this tab only.
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, data.access_token)
  return data
}

export function register(details: RegisterRequest): Promise<RegisterResponse> {
  return postJson<RegisterResponse>('/api/auth/register', details)
}
