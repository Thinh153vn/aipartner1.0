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
 * Googleカレンダーをタスクへ取り込む API。
 * 設定検証・同期期間・Google呼び出しは CalendarService に委譲する。
 */
@RestController
@RequestMapping("/api/v1/calendar")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    /** 現在の設定状態（実APIキーは返さない）。 */
    @GetMapping("/settings")
    public ResponseEntity<CalendarSettingsResponse> getSettings() {
        return ResponseEntity.ok(calendarService.getSettingsStatus());
    }

    /** calendarId と apiKey をローカル設定へ保存する。 */
    @PutMapping("/settings")
    public ResponseEntity<CalendarSettingsResponse> saveSettings(@Valid @RequestBody CalendarSettingsRequest request) {
        return ResponseEntity.ok(calendarService.saveSettings(request.calendarId(), request.apiKey()));
    }

    /**
     * 即時同期。本日前後約1か月の予定を取得し、フロントのカレンダーへ載せる。
     */
    @PostMapping("/sync")
    public ResponseEntity<CalendarSyncResponse> sync() {
        return ResponseEntity.ok(calendarService.syncNow());
    }
}
