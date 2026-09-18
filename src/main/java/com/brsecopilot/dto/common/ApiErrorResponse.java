package com.brsecopilot.dto.common;

import java.time.Instant;

/**
 * REST API 共通のエラー応答形式。
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
