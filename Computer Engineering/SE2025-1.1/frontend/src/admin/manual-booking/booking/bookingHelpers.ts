/**
 * Booking Helper Functions
 */

export const PHONE_PATTERN = /^[0-9+\s()-]{10,}$/

export const formatDateVN = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export const formatPriceVN = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price)
}

export const getMinDate = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

export const getMaxDate = (): string => {
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  return maxDate.toISOString().split('T')[0]
}

export const calculateTotalPrice = (seatCount: number, pricePerSeat: number = 120000): number => {
  return seatCount * pricePerSeat
}

export const validatePhone = (phone: string): boolean => {
  return PHONE_PATTERN.test(phone)
}

export const validateCustomerName = (name: string): boolean => {
  return name.trim().length > 0
}
