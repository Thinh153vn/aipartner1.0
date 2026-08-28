package com.brsecopilot.dto.calendar;

import java.time.LocalDate;

/**
 * 1 Task được suy ra từ 1 sự kiện (event) trên Google Calendar sau khi đồng bộ.
 * id luôn có tiền tố "gcal-" để frontend phân biệt được với Task mock cục bộ.
 */
public record SyncedTaskDto(
        String id,
        String title,
        LocalDate dueDate
) {
}
