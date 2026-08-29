package com.brsecopilot.service;

import com.brsecopilot.dto.offshore.OffshoreReviewRequest;
import com.brsecopilot.dto.offshore.OffshoreReviewResponse;
import com.brsecopilot.exception.InvalidRequestException;
import com.brsecopilot.service.offshore.OffshoreReviewStrategy;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Nghiệp vụ "Trợ lý Offshore": SPEC_DIFF / SHADOW_CLIENT / UNIT_TEST_GEN /
 * TEST_CASE_GEN. Áp dụng Strategy Pattern: Service này chỉ
 * chịu trách nhiệm CHỌN đúng strategy theo {@code request.mode()} rồi uỷ quyền
 * xử lý, không còn if/else nghiệp vụ nằm trong 1 method dài như trước.
 */
@Service
public class OffshoreReviewService {

    private final List<OffshoreReviewStrategy> strategies;

    public OffshoreReviewService(List<OffshoreReviewStrategy> strategies) {
        this.strategies = strategies;
    }

    public OffshoreReviewResponse review(OffshoreReviewRequest request) {
        return strategies.stream()
                .filter(strategy -> strategy.supports(request.mode()))
                .findFirst()
                .orElseThrow(() -> new InvalidRequestException("不明な mode が指定されました: " + request.mode()))
                .execute(request);
    }
}
