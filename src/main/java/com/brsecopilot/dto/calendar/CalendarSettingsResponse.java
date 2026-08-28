package com.brsecopilot.dto.calendar;

import com.brsecopilot.service.CalendarSettingsService.StoredSettings;

/**
 * Response trả về trạng thái cấu hình hiện tại.
 * KHÔNG bao giờ trả lại giá trị apiKey thật ra ngoài (chỉ trả cờ đã cấu hình hay chưa)
 * để tránh lộ key qua Network tab của browser.
 */
public record CalendarSettingsResponse(
        String calendarId,
        boolean apiKeyConfigured
) {

    private static final CalendarSettingsResponse EMPTY = new CalendarSettingsResponse(null, false);

    public static CalendarSettingsResponse empty() {
        return EMPTY;
    }

    /** Map từ dữ liệu lưu trên đĩa sang response public, không để lộ apiKey thật. */
    public static CalendarSettingsResponse from(StoredSettings stored) {
        boolean apiKeyConfigured = stored.apiKey() != null && !stored.apiKey().isBlank();
        return new CalendarSettingsResponse(stored.calendarId(), apiKeyConfigured);
    }
}
