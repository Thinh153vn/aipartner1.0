package com.brsecopilot.dto.schedule;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/** スケジュール分析リクエスト。フロントが保持するタスク一覧を送る。 */
public record ScheduleAnalysisRequest(
        @NotEmpty(message = "タスクリストは空にできません")
        @Size(max = 50, message = "タスクは最大50件まで送信できます")
        List<@Valid TaskItemDto> tasks
) {
}
