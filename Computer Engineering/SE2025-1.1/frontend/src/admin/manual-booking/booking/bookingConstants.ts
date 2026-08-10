export type BookingStep =
  | 'select-movie'
  | 'select-date'
  | 'select-theater'
  | 'select-showtime'
  | 'select-seats'
  | 'customer-info'
  | 'confirm'
  | 'payment'

export const STEP_LABELS: Record<BookingStep, string> = {
  'select-movie': '1. Chọn Phim',
  'select-date': '2. Chọn Ngày',
  'select-theater': '3. Chọn Rạp',
  'select-showtime': '4. Chọn Suất',
  'select-seats': '5. Chọn Ghế',
  'customer-info': '6. Thông Tin KH',
  'confirm': '7. Xác Nhận',
  'payment': '8. Thanh Toán',
}

export const BOOKING_MESSAGES = {
  LOADING_MOVIES: 'Đang tải danh sách phim...',
  NO_MOVIES: 'Không có phim để hiển thị.',
  SELECT_DATE_HINT: 'Chọn ngày chiếu',
  LOADING_THEATERS: 'Đang tải danh sách rạp...',
  NO_THEATERS: 'Không có rạp phù hợp.',
  LOADING_SHOWTIMES: 'Đang tải suất chiếu...',
  NO_SHOWTIMES: 'Không có suất chiếu cho lựa chọn này.',
  SELECT_SHOWTIME_HINT: 'Chọn suất chiếu',
  SELECT_SEATS_ERROR: 'Vui lòng chọn ít nhất một ghế.',
  CUSTOMER_NAME_ERROR: 'Vui lòng nhập tên khách hàng.',
  PHONE_ERROR: 'Số điện thoại không hợp lệ.',
  BOOKING_ERROR: 'Không thể đặt vé. Vui lòng thử lại.',
  BOOKING_SUCCESS: 'Đặt vé thành công.',
}

export const BUTTON_LABELS = {
  BACK: 'Quay lại',
  CONTINUE: 'Tiếp tục',
  CONFIRM: 'Xác nhận & Thanh toán',
}

export { PHONE_PATTERN } from './bookingHelpers'
