package com.brsecopilot.dto.calendar;

import java.time.Instant;
import java.util.List;

/**
 * Googleカレンダー同期1回分の結果。
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
