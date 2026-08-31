package com.brsecopilot.dto.schedule;

import java.util.List;

/** 再スケジュール案と所見、上司向けメール下書き。 */
public record ScheduleAnalysisResponse(
        List<RebalancedTaskDto> rebalancedTasks,
        String findingsSummary,
        String draftEmailBody
) {
}
