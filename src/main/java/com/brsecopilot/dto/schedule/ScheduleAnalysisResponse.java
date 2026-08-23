package com.brsecopilot.dto.schedule;

import java.util.List;

public record ScheduleAnalysisResponse(
        List<RebalancedTaskDto> rebalancedTasks,
        String findingsSummary,
        String draftEmailBody
) {
}
