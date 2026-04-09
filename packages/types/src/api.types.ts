export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: {
    message: string
    code?: string
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}
