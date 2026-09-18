package com.brsecopilot.dto.schedule;

import java.time.LocalDate;

/**
 * AIが期日を動かした1件分の提案。
 */
public record RebalancedTaskDto(
        String taskId,
        String title,
        int delayDays,
        LocalDate newDueDate
) {
}
