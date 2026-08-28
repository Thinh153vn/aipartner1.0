package com.brsecopilot.dto.calendar;

import java.time.Instant;
import java.util.List;

/**
 * Kết quả của 1 lần đồng bộ Google Calendar.
 */
public record CalendarSyncResponse(
        List<SyncedTaskDto> tasks,
        int syncedCount,
        Instant syncedAt
) {
    public static CalendarSyncResponse of(List<SyncedTaskDto> tasks) {
        return new CalendarSyncResponse(tasks, tasks.size(), Instant.now());
    }
}
