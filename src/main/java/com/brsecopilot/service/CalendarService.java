package com.brsecopilot.service;

import com.brsecopilot.dto.calendar.CalendarSettingsResponse;
import com.brsecopilot.dto.calendar.CalendarSyncResponse;
import com.brsecopilot.exception.InvalidRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Orchestration layer cho nghiệp vụ "liên kết + đồng bộ Google Calendar".
 * Tách riêng khỏi Controller để Controller chỉ đóng vai trò nhận/trả HTTP,
 * không chứa logic nghiệp vụ (validate cấu hình, tính khoảng ngày đồng bộ...).
 *
 * Phụ thuộc (composition) vào 2 service chuyên biệt hơn:
 *  - CalendarSettingsService: đọc/ghi cấu hình (calendarId, apiKey) trên đĩa.
 *  - GoogleCalendarService: gọi Google Calendar API v3 thật.
 */
@Service
public class CalendarService {

    private static final Logger log = LoggerFactory.getLogger(CalendarService.class);

    /** Đồng bộ ±1 tháng quanh hôm nay theo yêu cầu nghiệp vụ đã xác nhận với người dùng. */
    private static final int SYNC_RANGE_MONTHS = 1;

    private final CalendarSettingsService settingsService;
    private final GoogleCalendarService googleCalendarService;

    public CalendarService(CalendarSettingsService settingsService, GoogleCalendarService googleCalendarService) {
        this.settingsService = settingsService;
        this.googleCalendarService = googleCalendarService;
    }

    /** Trạng thái cấu hình hiện tại (không bao giờ trả lại apiKey thật). */
    public CalendarSettingsResponse getSettingsStatus() {
        return settingsService.load()
                .map(CalendarSettingsResponse::from)
                .orElseGet(CalendarSettingsResponse::empty);
    }

    /** Lưu/cập nhật cấu hình liên kết Google Calendar. */
    public CalendarSettingsResponse saveSettings(String calendarId, String apiKey) {
        var saved = settingsService.save(calendarId, apiKey);
        return CalendarSettingsResponse.from(saved);
    }

    /**
     * Đồng bộ ngay: kiểm tra cấu hình đã đầy đủ, lấy toàn bộ event trong khoảng
     * ±1 tháng quanh hôm nay từ Google Calendar, trả về danh sách Task tương ứng.
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
