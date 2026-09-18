package com.brsecopilot.dto.calendar;

import jakarta.validation.constraints.NotBlank;

/**
 * Googleカレンダー連携の保存リクエスト（APIキー方式。OAuthは使わない）。
 * apiKey が空なら既存キーを残し、calendarId だけ変更できる。
 */
public record CalendarSettingsRequest(
        @NotBlank(message = "カレンダーIDは必須です") String calendarId,
        String apiKey
) {
}
