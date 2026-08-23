package com.brsecopilot.dto.schedule;

import java.time.LocalDate;

/**
 * Kết quả AI đề xuất cho 1 Task bị dời lịch.
 */
public record RebalancedTaskDto(
        String taskId,
        String title,
        int delayDays,
        LocalDate newDueDate
) {
}
