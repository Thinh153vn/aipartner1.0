package com.brsecopilot.exception;

/**
 * Dùng cho các lỗi validate chéo giữa nhiều field (ví dụ: OffshoreReviewRequest
 * thiếu field bắt buộc tương ứng với mode) mà Bean Validation không xử lý được.
 * Được GlobalExceptionHandler bắt và trả HTTP 400.
 */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
