package com.brsecopilot.controller;

import com.brsecopilot.dto.calendar.CalendarSettingsRequest;
import com.brsecopilot.dto.calendar.CalendarSettingsResponse;
import com.brsecopilot.dto.calendar.CalendarSyncResponse;
import com.brsecopilot.service.CalendarService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST API cho tính năng "tự đồng bộ Google Calendar vào Task", giúp người dùng
 * không cần nhập lại thủ công lịch trình đã có trên Google Calendar.
 *
 * Toàn bộ logic nghiệp vụ (validate cấu hình, tính khoảng ngày đồng bộ, gọi Google
 * API) được uỷ quyền cho CalendarService; Controller chỉ nhận/trả HTTP.
 */
@RestController
@RequestMapping("/api/v1/calendar")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    /** Trả trạng thái cấu hình hiện tại (không trả lại apiKey thật). */
    @GetMapping("/settings")
    public ResponseEntity<CalendarSettingsResponse> getSettings() {
        return ResponseEntity.ok(calendarService.getSettingsStatus());
    }

    /** Lưu/cập nhật calendarId + apiKey vào file cấu hình cục bộ. */
    @PutMapping("/settings")
    public ResponseEntity<CalendarSettingsResponse> saveSettings(@Valid @RequestBody CalendarSettingsRequest request) {
        return ResponseEntity.ok(calendarService.saveSettings(request.calendarId(), request.apiKey()));
    }

    /**
     * Đồng bộ ngay: lấy toàn bộ event trong khoảng ±1 tháng quanh hôm nay từ
     * Google Calendar đã cấu hình, trả về danh sách Task tương ứng cho frontend
     * gắn vào lịch (calendar-grid) mà không cần nhập tay.
     */
    @PostMapping("/sync")
    public ResponseEntity<CalendarSyncResponse> sync() {
        return ResponseEntity.ok(calendarService.syncNow());
    }
}
