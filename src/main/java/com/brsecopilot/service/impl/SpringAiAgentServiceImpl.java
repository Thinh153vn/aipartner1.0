package com.brsecopilot.service.impl;

import com.brsecopilot.config.AiPrompts;
import com.brsecopilot.dto.nippo.NippoGenerationResponse;
import com.brsecopilot.dto.offshore.OffshoreReviewRequest;
import com.brsecopilot.dto.offshore.OffshoreReviewResponse;
import com.brsecopilot.dto.offshore.ReviewMode;
import com.brsecopilot.dto.schedule.ScheduleAnalysisRequest;
import com.brsecopilot.dto.schedule.ScheduleAnalysisResponse;
import com.brsecopilot.dto.sos.SosAlertRequest;
import com.brsecopilot.dto.sos.SosAlertResponse;
import com.brsecopilot.exception.AiAgentException;
import com.brsecopilot.exception.InvalidRequestException;
import com.brsecopilot.service.AiAgentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Implementation gọi Google Gemini thật (Gemini Developer API) thông qua Spring AI ChatClient.
 * Mỗi phương thức nghiệp vụ dựng System Prompt + User Prompt tương ứng,
 * rồi dùng ChatClient.entity(...) để nhận trực tiếp DTO đã được deserialize
 * từ JSON (Spring AI tự sinh JSON schema từ record và ép model tuân theo).
 */
@Service
public class SpringAiAgentServiceImpl implements AiAgentService {

    private static final Logger log = LoggerFactory.getLogger(SpringAiAgentServiceImpl.class);

    private final ChatClient chatClient;

    public SpringAiAgentServiceImpl(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public ScheduleAnalysisResponse analyzeSchedule(ScheduleAnalysisRequest request) {
        StringBuilder tasksDescription = new StringBuilder();
        for (var task : request.tasks()) {
            tasksDescription.append("- ID=%s, タイトル=%s, 期日=%s%n"
                    .formatted(task.id(), task.title(), task.dueDate()));
        }

        String userPrompt = """
                本日の日付は %s です。
                以下は現在のタスク一覧です：
                %s
                このタスク一覧を分析し、遅延タスクの検知とスケジュール再調整案を提示してください。
                """.formatted(LocalDate.now(), tasksDescription);

        return callAi(AiPrompts.SCHEDULE_ANALYSIS_SYSTEM, userPrompt, ScheduleAnalysisResponse.class,
                "スケジュール分析");
    }

    @Override
    public SosAlertResponse generateSosAlert(SosAlertRequest request) {
        String userPrompt = """
                対象ファイル: %s
                コミットが無い経過時間: %d分
                このエンジニアはこのファイルの実装で行き詰まっている可能性があります。
                """.formatted(request.fileName(), request.stuckMinutes());

        return callAi(AiPrompts.SOS_ALERT_SYSTEM, userPrompt, SosAlertResponse.class, "SOSアラート生成");
    }

    @Override
    public NippoGenerationResponse generateNippo(String rawLogs) {
        String userPrompt = """
                以下は本日の作業ログ（Gitコミット履歴やタスクメモ）です：
                %s

                この内容から日報を作成してください。
                """.formatted(rawLogs);

        return callAi(AiPrompts.NIPPO_GENERATION_SYSTEM, userPrompt, NippoGenerationResponse.class, "日報生成");
    }

    @Override
    public OffshoreReviewResponse reviewOffshore(OffshoreReviewRequest request) {
        if (request.mode() == ReviewMode.SPEC_DIFF) {
            if (isBlank(request.specText()) || isBlank(request.codeText())) {
                throw new InvalidRequestException("SPEC_DIFFモードでは specText と codeText の両方が必須です。");
            }

            String userPrompt = """
                    【仕様書】
                    %s

                    【ソースコード】
                    %s

                    仕様書とソースコードを比較し、不整合を分析してください。
                    """.formatted(request.specText(), request.codeText());

            return callAi(AiPrompts.OFFSHORE_SPEC_DIFF_SYSTEM, userPrompt, OffshoreReviewResponse.class,
                    "Spec vs Code 比較");
        }

        if (request.mode() == ReviewMode.SHADOW_CLIENT) {
            if (isBlank(request.rawQuestion())) {
                throw new InvalidRequestException("SHADOW_CLIENTモードでは rawQuestion が必須です。");
            }

            String userPrompt = """
                    以下はオフショアエンジニアが顧客に送ろうとしている質問の下書きです：
                    %s

                    この質問をレビューしてください。
                    """.formatted(request.rawQuestion());

            return callAi(AiPrompts.OFFSHORE_SHADOW_CLIENT_SYSTEM, userPrompt, OffshoreReviewResponse.class,
                    "Shadow Client レビュー");
        }

        throw new InvalidRequestException("不明な mode が指定されました: " + request.mode());
    }

    /**
     * Gọi ChatClient dùng chung, thống nhất xử lý lỗi cho cả 4 nghiệp vụ:
     * mọi lỗi giao tiếp/parse JSON đều được bọc thành AiAgentException để
     * GlobalExceptionHandler trả về 502 thân thiện thay vì crash 500.
     */
    private <T> T callAi(String systemPrompt, String userPrompt, Class<T> responseType, String operationName) {
        try {
            T result = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .entity(responseType);

            if (result == null) {
                throw new AiAgentException("AIエージェントから空の応答が返されました（" + operationName + "）。");
            }
            return result;
        } catch (AiAgentException | InvalidRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("{} の呼び出し中にエラーが発生しました", operationName, ex);
            throw new AiAgentException(
                    "AIエージェントの応答形式が不正、または通信に失敗しました（" + operationName + "）。", ex);
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
