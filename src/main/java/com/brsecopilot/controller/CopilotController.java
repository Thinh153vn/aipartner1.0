package com.brsecopilot.controller;

import com.brsecopilot.dto.nippo.NippoGenerationRequest;
import com.brsecopilot.dto.nippo.NippoGenerationResponse;
import com.brsecopilot.dto.offshore.OffshoreReviewRequest;
import com.brsecopilot.dto.offshore.OffshoreReviewResponse;
import com.brsecopilot.dto.schedule.ScheduleAnalysisRequest;
import com.brsecopilot.dto.schedule.ScheduleAnalysisResponse;
import com.brsecopilot.dto.sos.SosAlertRequest;
import com.brsecopilot.dto.sos.SosAlertResponse;
import com.brsecopilot.service.NippoGenerationService;
import com.brsecopilot.service.OffshoreReviewService;
import com.brsecopilot.service.ScheduleAnalysisService;
import com.brsecopilot.service.SosAlertService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST API cho AI PARTNER Autonomous AI Agent Dashboard.
 *
 * Mỗi nghiệp vụ AI (schedule analysis, SOS alert, nippo generation, offshore
 * review) có 1 Service riêng biệt (Single Responsibility) thay vì dùng chung
 * 1 "God Service" như trước; Controller chỉ nhận request đã validate (@Valid)
 * và uỷ quyền toàn bộ xử lý cho Service tương ứng, không chứa business logic.
 * Lỗi được xử lý tập trung ở GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/v1/copilot")
public class CopilotController {

    private final ScheduleAnalysisService scheduleAnalysisService;
    private final SosAlertService sosAlertService;
    private final NippoGenerationService nippoGenerationService;
    private final OffshoreReviewService offshoreReviewService;

    public CopilotController(
            ScheduleAnalysisService scheduleAnalysisService,
            SosAlertService sosAlertService,
            NippoGenerationService nippoGenerationService,
            OffshoreReviewService offshoreReviewService) {
        this.scheduleAnalysisService = scheduleAnalysisService;
        this.sosAlertService = sosAlertService;
        this.nippoGenerationService = nippoGenerationService;
        this.offshoreReviewService = offshoreReviewService;
    }

    /** Auto-Rebalance: phân tích WBS, phát hiện task trễ hạn và đề xuất dời lịch. */
    @PostMapping("/analyze-schedule")
    public ResponseEntity<ScheduleAnalysisResponse> analyzeSchedule(
            @Valid @RequestBody ScheduleAnalysisRequest request) {
        return ResponseEntity.ok(scheduleAnalysisService.analyze(request));
    }

    /** Auto SOS: phát hiện kẹt logic lâu, soạn tin nhắn cầu cứu Senior. */
    @PostMapping("/sos-alert")
    public ResponseEntity<SosAlertResponse> sosAlert(@Valid @RequestBody SosAlertRequest request) {
        return ResponseEntity.ok(sosAlertService.generateAlert(request));
    }

    /** Git to Nippo: sinh báo cáo ngày từ log Git/công việc thô. */
    @PostMapping("/generate-nippo")
    public ResponseEntity<NippoGenerationResponse> generateNippo(
            @Valid @RequestBody NippoGenerationRequest request) {
        return ResponseEntity.ok(nippoGenerationService.generate(request.rawLogs()));
    }

    /** Trợ lý Offshore: SPEC_DIFF / SHADOW_CLIENT / UNIT_TEST_GEN / TEST_CASE_GEN. */
    @PostMapping("/review-offshore")
    public ResponseEntity<OffshoreReviewResponse> reviewOffshore(
            @Valid @RequestBody OffshoreReviewRequest request) {
        return ResponseEntity.ok(offshoreReviewService.review(request));
    }
}
