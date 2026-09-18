package com.brsecopilot.dto.calendar;

import com.brsecopilot.service.CalendarSettingsService.StoredSettings;

/**
 * 設定状態の応答。実APIキーは返さず、設定済みフラグのみ返す。
 */
public record CalendarSettingsResponse(
        String calendarId,
        boolean apiKeyConfigured
) {

    private static final CalendarSettingsResponse EMPTY = new CalendarSettingsResponse(null, false);

    public static CalendarSettingsResponse empty() {
        return EMPTY;
    }

    /** ディスク上の設定を公開応答へ写す（キーは出さない）。 */
    public static CalendarSettingsResponse from(StoredSettings stored) {
        boolean apiKeyConfigured = stored.apiKey() != null && !stored.apiKey().isBlank();
        return new CalendarSettingsResponse(stored.calendarId(), apiKeyConfigured);
    }
}
