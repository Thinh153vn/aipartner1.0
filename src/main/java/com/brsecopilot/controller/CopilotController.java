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
 * GROWTH PARTNER の REST API。
 * スケジュール分析・SOS・日報・オフショアはそれぞれ専用 Service に委譲する（Controller に業務ロジックを置かない）。
 * 例外は GlobalExceptionHandler で集約する。
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

    /** 遅延タスクを検出し、再スケジュール案を返す。 */
    @PostMapping("/analyze-schedule")
    public ResponseEntity<ScheduleAnalysisResponse> analyzeSchedule(
            @Valid @RequestBody ScheduleAnalysisRequest request) {
        return ResponseEntity.ok(scheduleAnalysisService.analyze(request));
    }

    /** 実装停滞を想定し、先輩への相談文面を用意する。 */
    @PostMapping("/sos-alert")
    public ResponseEntity<SosAlertResponse> sosAlert(@Valid @RequestBody SosAlertRequest request) {
        return ResponseEntity.ok(sosAlertService.generateAlert(request));
    }

    /** Git／作業ログから日報を生成する。 */
    @PostMapping("/generate-nippo")
    public ResponseEntity<NippoGenerationResponse> generateNippo(
            @Valid @RequestBody NippoGenerationRequest request) {
        return ResponseEntity.ok(nippoGenerationService.generate(request.rawLogs()));
    }

    /** オフショア支援：仕様比較／顧客質問／ユニットテスト／テストケース。 */
    @PostMapping("/review-offshore")
    public ResponseEntity<OffshoreReviewResponse> reviewOffshore(
            @Valid @RequestBody OffshoreReviewRequest request) {
        return ResponseEntity.ok(offshoreReviewService.review(request));
    }
}
