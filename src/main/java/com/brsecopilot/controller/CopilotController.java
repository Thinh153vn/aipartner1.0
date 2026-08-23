package com.brsecopilot.controller;

import com.brsecopilot.dto.nippo.NippoGenerationRequest;
import com.brsecopilot.dto.nippo.NippoGenerationResponse;
import com.brsecopilot.dto.offshore.OffshoreReviewRequest;
import com.brsecopilot.dto.offshore.OffshoreReviewResponse;
import com.brsecopilot.dto.schedule.ScheduleAnalysisRequest;
import com.brsecopilot.dto.schedule.ScheduleAnalysisResponse;
import com.brsecopilot.dto.sos.SosAlertRequest;
import com.brsecopilot.dto.sos.SosAlertResponse;
import com.brsecopilot.service.AiAgentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST API cho BrSE Copilot Autonomous AI Agent Dashboard.
 * Toàn bộ endpoint dùng chung 1 AiAgentService, lỗi được xử lý tập trung ở
 * GlobalExceptionHandler nên Controller chỉ tập trung vào việc nhận request
 * đã validate (@Valid) và trả response.
 */
@RestController
@RequestMapping("/api/v1/copilot")
public class CopilotController {

    private final AiAgentService aiAgentService;

    public CopilotController(AiAgentService aiAgentService) {
        this.aiAgentService = aiAgentService;
    }

    /** Auto-Rebalance: phân tích WBS, phát hiện task trễ hạn và đề xuất dời lịch. */
    @PostMapping("/analyze-schedule")
    public ResponseEntity<ScheduleAnalysisResponse> analyzeSchedule(
            @Valid @RequestBody ScheduleAnalysisRequest request) {
        return ResponseEntity.ok(aiAgentService.analyzeSchedule(request));
    }

    /** Auto SOS: phát hiện kẹt logic lâu, soạn tin nhắn cầu cứu Senior. */
    @PostMapping("/sos-alert")
    public ResponseEntity<SosAlertResponse> sosAlert(@Valid @RequestBody SosAlertRequest request) {
        return ResponseEntity.ok(aiAgentService.generateSosAlert(request));
    }

    /** Git to Nippo: sinh báo cáo ngày từ log Git/công việc thô. */
    @PostMapping("/generate-nippo")
    public ResponseEntity<NippoGenerationResponse> generateNippo(
            @Valid @RequestBody NippoGenerationRequest request) {
        return ResponseEntity.ok(aiAgentService.generateNippo(request.rawLogs()));
    }

    /** Trợ lý Offshore: dùng chung cho Spec vs Code diff (SPEC_DIFF) và Shadow Client (SHADOW_CLIENT). */
    @PostMapping("/review-offshore")
    public ResponseEntity<OffshoreReviewResponse> reviewOffshore(
            @Valid @RequestBody OffshoreReviewRequest request) {
        return ResponseEntity.ok(aiAgentService.reviewOffshore(request));
    }
}
