package com.brsecopilot.exception;

/**
 * Ném ra khi việc đồng bộ Google Calendar thất bại: chưa cấu hình, API Key sai,
 * Calendar ID không tồn tại, hoặc Calendar chưa được chia sẻ công khai (public).
 * Được GlobalExceptionHandler bắt và trả HTTP 502 kèm message thân thiện
 * (message ở đây được hiển thị trực tiếp cho người dùng nên cần rõ nguyên nhân).
 */
public class CalendarSyncException extends RuntimeException {

    public CalendarSyncException(String message) {
        super(message);
    }

    public CalendarSyncException(String message, Throwable cause) {
        super(message, cause);
    }
}
