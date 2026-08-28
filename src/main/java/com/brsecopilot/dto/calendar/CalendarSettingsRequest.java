package com.brsecopilot.dto.calendar;

import jakarta.validation.constraints.NotBlank;

/**
 * Request lưu cấu hình liên kết Google Calendar (chỉ dùng API Key, không OAuth).
 * apiKey có thể để trống nếu người dùng chỉ muốn đổi calendarId và giữ nguyên
 * API Key đã lưu trước đó (xem CalendarSettingsService#save).
 */
public record CalendarSettingsRequest(
        @NotBlank(message = "カレンダーIDは必須です") String calendarId,
        String apiKey
) {
}
