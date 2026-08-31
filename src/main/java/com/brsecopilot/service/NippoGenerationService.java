package com.brsecopilot.service;

import com.brsecopilot.config.AiPrompts;
import com.brsecopilot.dto.nippo.NippoGenerationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Git／作業ログから日報を生成する。プロンプト組み立てとAI呼び出しのみを担う。
 */
@Service
public class NippoGenerationService {

    private static final Logger log = LoggerFactory.getLogger(NippoGenerationService.class);
    private static final String OPERATION_NAME = "日報生成";

    private final AiChatExecutor aiChatExecutor;

    public NippoGenerationService(AiChatExecutor aiChatExecutor) {
        this.aiChatExecutor = aiChatExecutor;
    }

    public NippoGenerationResponse generate(String rawLogs) {
        log.info("日報生成リクエストを受信しました rawLogsLength={}", rawLogs == null ? 0 : rawLogs.length());

        String userPrompt = """
                以下は本日の作業ログ（Gitコミット履歴やタスクメモ）です：
                %s

                この内容から日報を作成してください。
                """.formatted(rawLogs);

        return aiChatExecutor.execute(
                AiPrompts.NIPPO_GENERATION_SYSTEM, userPrompt, NippoGenerationResponse.class, OPERATION_NAME);
    }
}
