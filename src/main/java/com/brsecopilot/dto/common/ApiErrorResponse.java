package com.brsecopilot.dto.common;

import java.time.Instant;

/**
 * Định dạng lỗi chuẩn trả về cho toàn bộ REST API.
 */
public record ApiErrorResponse(
        int code,
        String message,
        Instant timestamp
) {
    public static ApiErrorResponse of(int code, String message) {
        return new ApiErrorResponse(code, message, Instant.now());
    }
}
