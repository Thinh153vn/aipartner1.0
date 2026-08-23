package com.brsecopilot.service;

import com.brsecopilot.dto.nippo.NippoGenerationResponse;
import com.brsecopilot.dto.offshore.OffshoreReviewRequest;
import com.brsecopilot.dto.offshore.OffshoreReviewResponse;
import com.brsecopilot.dto.schedule.ScheduleAnalysisRequest;
import com.brsecopilot.dto.schedule.ScheduleAnalysisResponse;
import com.brsecopilot.dto.sos.SosAlertRequest;
import com.brsecopilot.dto.sos.SosAlertResponse;

/**
 * Trừu tượng hoá toàn bộ lời gọi AI cho nghiệp vụ BrSE Copilot.
 * Controller chỉ phụ thuộc vào interface này, không biết implementation
 * đang dùng Spring AI/OpenAI hay provider nào khác.
 */
public interface AiAgentService {

    ScheduleAnalysisResponse analyzeSchedule(ScheduleAnalysisRequest request);

    SosAlertResponse generateSosAlert(SosAlertRequest request);

    NippoGenerationResponse generateNippo(String rawLogs);

    OffshoreReviewResponse reviewOffshore(OffshoreReviewRequest request);
}
