package com.brsecopilot.service;

import com.brsecopilot.dto.calendar.CalendarSettingsResponse;
import com.brsecopilot.dto.calendar.CalendarSyncResponse;
import com.brsecopilot.exception.InvalidRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Googleカレンダー連携のオーケストレーション。
 * 設定の読み書きは CalendarSettingsService、API呼び出しは GoogleCalendarService。
 */
@Service
public class CalendarService {

    private static final Logger log = LoggerFactory.getLogger(CalendarService.class);

    /** 本日前後1か月を同期する。 */
    private static final int SYNC_RANGE_MONTHS = 1;

    private final CalendarSettingsService settingsService;
    private final GoogleCalendarService googleCalendarService;

    public CalendarService(CalendarSettingsService settingsService, GoogleCalendarService googleCalendarService) {
        this.settingsService = settingsService;
        this.googleCalendarService = googleCalendarService;
    }

    /** 現在の設定状態（実APIキーは返さない）。 */
    public CalendarSettingsResponse getSettingsStatus() {
        return settingsService.load()
                .map(CalendarSettingsResponse::from)
                .orElseGet(CalendarSettingsResponse::empty);
    }

    /** Googleカレンダー連携設定を保存する。 */
    public CalendarSettingsResponse saveSettings(String calendarId, String apiKey) {
        var saved = settingsService.save(calendarId, apiKey);
        return CalendarSettingsResponse.from(saved);
    }

    /**
     * 設定を確認し、本日前後1か月の予定をタスク一覧として返す。
     */
    public CalendarSyncResponse syncNow() {
        var settings = settingsService.load()
                .filter(this::isFullyConfigured)
                .orElseThrow(() -> new InvalidRequestException(
                        "Googleカレンダーの設定（カレンダーID・APIキー）を先に登録してください。"));

        LocalDate today = LocalDate.now();
        LocalDate timeMin = today.minusMonths(SYNC_RANGE_MONTHS);
        LocalDate timeMax = today.plusMonths(SYNC_RANGE_MONTHS);

        log.info("Googleカレンダー同期を開始します calendarId={} range=[{}, {}]",
                settings.calendarId(), timeMin, timeMax);

        var tasks = googleCalendarService.fetchEvents(settings.calendarId(), settings.apiKey(), timeMin, timeMax);

        log.info("Googleカレンダー同期が完了しました calendarId={} syncedCount={}",
                settings.calendarId(), tasks.size());

        return CalendarSyncResponse.of(tasks);
    }

    private boolean isFullyConfigured(CalendarSettingsService.StoredSettings settings) {
        return settings.calendarId() != null && !settings.calendarId().isBlank()
                && settings.apiKey() != null && !settings.apiKey().isBlank();
    }
}
