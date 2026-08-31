package com.brsecopilot.service;

import com.brsecopilot.config.AiPrompts;
import com.brsecopilot.dto.sos.SosAlertRequest;
import com.brsecopilot.dto.sos.SosAlertResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * 実装停滞を想定したSOS。先輩への相談文面をAIで用意する。
 */
@Service
public class SosAlertService {

    private static final Logger log = LoggerFactory.getLogger(SosAlertService.class);
    private static final String OPERATION_NAME = "SOSアラート生成";

    private final AiChatExecutor aiChatExecutor;

    public SosAlertService(AiChatExecutor aiChatExecutor) {
        this.aiChatExecutor = aiChatExecutor;
    }

    public SosAlertResponse generateAlert(SosAlertRequest request) {
        log.info("SOSアラート生成リクエストを受信しました fileName={} stuckMinutes={}",
                request.fileName(), request.stuckMinutes());

        String userPrompt = """
                対象ファイル: %s
                コミットが無い経過時間: %d分
                このエンジニアはこのファイルの実装で行き詰まっている可能性があります。
                """.formatted(request.fileName(), request.stuckMinutes());

        return aiChatExecutor.execute(AiPrompts.SOS_ALERT_SYSTEM, userPrompt, SosAlertResponse.class, OPERATION_NAME);
    }
}
