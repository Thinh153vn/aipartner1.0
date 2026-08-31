package com.brsecopilot.dto.calendar;

import java.time.LocalDate;

/**
 * 同期したGoogleカレンダー予定。id は gcal- 接頭辞でローカルモックと区別する。
 */
public record SyncedTaskDto(
        String id,
        String title,
        LocalDate dueDate
) {
}
