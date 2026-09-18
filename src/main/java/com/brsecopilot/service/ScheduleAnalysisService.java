package com.brsecopilot.service;

import com.brsecopilot.config.AiPrompts;
import com.brsecopilot.dto.schedule.ScheduleAnalysisRequest;
import com.brsecopilot.dto.schedule.ScheduleAnalysisResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * WBS上の遅延を検出し、再スケジュール案をAIで作る。
 */
@Service
public class ScheduleAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(ScheduleAnalysisService.class);
    private static final String OPERATION_NAME = "スケジュール分析";

    private final AiChatExecutor aiChatExecutor;

    public ScheduleAnalysisService(AiChatExecutor aiChatExecutor) {
        this.aiChatExecutor = aiChatExecutor;
    }

    public ScheduleAnalysisResponse analyze(ScheduleAnalysisRequest request) {
        log.info("スケジュール分析リクエストを受信しました taskCount={}", request.tasks().size());

        String userPrompt = """
                本日の日付は %s です。
                以下は現在のタスク一覧です：
                %s
                このタスク一覧を分析し、遅延タスクの検知とスケジュール再調整案を提示してください。
                """.formatted(LocalDate.now(), buildTasksDescription(request));

        return aiChatExecutor.execute(
                AiPrompts.SCHEDULE_ANALYSIS_SYSTEM, userPrompt, ScheduleAnalysisResponse.class, OPERATION_NAME);
    }

    private String buildTasksDescription(ScheduleAnalysisRequest request) {
        StringBuilder tasksDescription = new StringBuilder();
        for (var task : request.tasks()) {
            tasksDescription.append("- ID=%s, タイトル=%s, 期日=%s%n"
                    .formatted(task.id(), task.title(), task.dueDate()));
        }
        return tasksDescription.toString();
    }
}
