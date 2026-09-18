package com.brsecopilot.service;

import com.brsecopilot.dto.offshore.OffshoreReviewRequest;
import com.brsecopilot.dto.offshore.OffshoreReviewResponse;
import com.brsecopilot.exception.InvalidRequestException;
import com.brsecopilot.service.offshore.OffshoreReviewStrategy;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * オフショア支援の窓口。{@code request.mode()} に応じた Strategy を選び、処理は委譲する。
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
