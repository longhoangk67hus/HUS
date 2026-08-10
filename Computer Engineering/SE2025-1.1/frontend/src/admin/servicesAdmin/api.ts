import { API } from "../../api/endpoints"
import type { AuthResponse, User } from "../../types"

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
  
let authToken: string | null =
  typeof window !== "undefined" ? localStorage.getItem("authToken") : null

const apiCall = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  // Read latest token from localStorage in case it was set after module load
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('authToken');
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (authToken) headers["Authorization"] = `Bearer ${authToken}`

  let response: Response
  try {
    // Log the full URL (helps debug connection/refused issues quickly)
    const fullUrl = `${API_BASE_URL}${endpoint}`
    console.debug('API CALL:', { endpoint, fullUrl, options })
    response = await fetch(fullUrl, {
      ...options,
      headers,
    })
  } catch (fetchErr) {
    // Network or CORS error (backend unreachable)
    console.error('Network error when calling API', { endpoint, err: fetchErr })
    const err = new Error('NetworkError: Unable to reach backend')
    ;(err as any).isNetworkError = true
    throw err
  }

  if (!response.ok) {
    const raw = await response.text().catch(() => '')
    let parsed: any = null
    try {
      parsed = raw ? JSON.parse(raw) : null
    } catch (e) {
      parsed = null
    }

    // Handle Unauthorized explicitly so UI can react (clear token, redirect to login)
    if (response.status === 401) {
      // log token for debug (do not expose in production logs)
      console.error('API call unauthorized', { endpoint, tokenPresent: !!authToken })
      authToken = null
      if (typeof window !== 'undefined') localStorage.removeItem('authToken')
      const err = new Error('Unauthorized')
      ;(err as any).status = 401
      throw err
    }

    const message = parsed?.errorMessage || parsed?.message || raw || `API Error: ${response.status}`
    // log detailed info to help debugging 500s
    console.error('API call failed', { endpoint, status: response.status, body: parsed ?? raw })
    const err = new Error(message)
    ;(err as any).status = response.status
    ;(err as any).response = parsed ?? raw
    throw err
  }

  const data = await response.json()

  // The backend may return either:
  // 1) a raw array/object (legacy), or
  // 2) a ServiceResponse wrapper { isSuccess, data, message }, or
  // 3) { success, data, message } wrapper (manual booking API)
  // Support all formats.
  let payload: any
  if (data && typeof data === "object") {
    // Check for isSuccess (ServiceResponse format)
    if (Object.prototype.hasOwnProperty.call(data, "isSuccess")) {
      if (!data.isSuccess) {
        throw new Error(data?.errorMessage || data?.message || "API Error")
      }
      payload = data.data
    }
    // Check for success (manual booking response format)
    else if (Object.prototype.hasOwnProperty.call(data, "success")) {
      if (!data.success) {
        throw new Error(data?.message || "API Error")
      }
      payload = data.data
    }
    else {
      payload = data
    }
  } else {
    payload = data
  }

  // Unwrap any nested ServiceResponse wrappers found inside `data` repeatedly.
  while (
    payload &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "isSuccess") &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    if (!payload.isSuccess) {
      throw new Error(payload.errorMessage || payload.message || "API Error")
    }
    payload = payload.data
  }

  return payload as T
}

export const setAuthToken = (token: string | null) => {
  authToken = token
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('authToken', token)
    else localStorage.removeItem('authToken')
  }
}

// ======== 🧩 AUTH API ========
export const authAPI = {
  register: async (userName: string, password: string, name: string, email?: string): Promise<AuthResponse> => {
    const payload: any = {
      userName,
      password,
      fullName: name,
    }
    if (email) payload.email = email

    const response = await apiCall<{
      token?: string
      user: User
    }>(API.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const returnedToken = (response as any).token ?? null
    if (returnedToken) {
      authToken = returnedToken
      localStorage.setItem("authToken", returnedToken)
    }

    return {
      token: returnedToken ?? "",
      user: response.user,
    };
  },

  login: async (userName: string, password: string): Promise<AuthResponse> => {
    const response = await apiCall<{
      token: string
      user: User
    }>(API.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ 
        userName,
        password
      }),
    });
    authToken = response.token;
    localStorage.setItem("authToken", response.token);
    return {
      token: response.token,
      user: response.user
    };
  },

  me: async (): Promise<User> => {
    return apiCall<User>(API.AUTH.ME);
  },

  logout: (): void => {
    authToken = null;
    localStorage.removeItem("authToken");
  },
}
export const manualBookingAPI = {
  create: async (
    showtimeId: number,
    seatIds: number[],
    customerName: string,
    customerPhone: string,
    paymentMethod?: string,
    reservationId?: number
  ): Promise<any | null> => {
    try {
      // Normalize paymentMethod to backend enum values ('Cash' | 'Card')
      let normalizedPayment: string = 'Cash' // default to Cash
      if (paymentMethod) {
        const pm = String(paymentMethod).toLowerCase()
        if (pm === 'cash') normalizedPayment = 'Cash'
        else if (pm === 'card' || pm === 'bank' || pm === 'bank-transfer' || pm === 'bank_transfer' || pm === 'vnpay') normalizedPayment = 'Card'
        else normalizedPayment = paymentMethod // fallback - let backend validate
      }

      const payload: any = {
        showtimeId,
        seatIds,
        customerName,
        customerPhone,
        paymentMethod: normalizedPayment,
      }
      if (reservationId) payload.reservationId = reservationId

      console.log('[manualBookingAPI] Creating booking with payload:', payload)

      return await apiCall<any>(API.ADMIN.MANUAL_BOOKING.CREATE, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('Error creating manual booking:', error)
      throw error
    }
  },

  getDetails: async (bookingId: number): Promise<any | null> => {
    try {
      return await apiCall<any>(API.ADMIN.MANUAL_BOOKING.DETAILS(bookingId))
    } catch (error) {
      console.error('Error fetching manual booking details:', error)
      return null
    }
  },

  cancel: async (bookingId: number): Promise<boolean> => {
    try {
      await apiCall<any>(API.ADMIN.MANUAL_BOOKING.CANCEL(bookingId), {
        method: 'PATCH',
      })
      return true
    } catch (error) {
      console.error('Error cancelling manual booking:', error)
      return false
    }
  },

  confirm: async (bookingId: number): Promise<boolean> => {
    try {
      await apiCall<any>(API.ADMIN.MANUAL_BOOKING.CONFIRM(bookingId), {
        method: 'POST',
      });
      return true
    } catch (error) {
      console.error('Error confirming manual booking:', error)
      throw error
    }
  },

  createPayment: async (bookingId: number): Promise<any | null> => {
    try {
      const idempotencyKey = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      return await apiCall<any>('/payments', {
        method: 'POST',
        body: JSON.stringify({
          bookingId,
          paymentMethod: 'EWallet',
          idempotencyKey,
          returnUrl: `${window.location.origin}/admin/manual-booking`
        })
      })
    } catch (error) {
      console.error('Error creating payment:', error)
      throw error
    }
  },

  simulatePaymentSuccess: async (paymentId: number): Promise<any | null> => {
    try {
      return await apiCall<any>(`/payments/test/simulate-success/${paymentId}`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error simulating payment success:', error)
      throw error
    }
  },

  createCashPayment: async (bookingId: number): Promise<any | null> => {
    try {
      return await apiCall<any>(`/payments/cash/${bookingId}`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error creating cash payment:', error)
      throw error
    }
  },
};