package com.brsecopilot.service.offshore;

import com.brsecopilot.dto.offshore.OffshoreReviewRequest;
import com.brsecopilot.dto.offshore.OffshoreReviewResponse;
import com.brsecopilot.dto.offshore.ReviewMode;

/**
 * /review-offshore の Strategy。
 * モード追加は実装クラスを足すだけでよく、既存 Service の if/else を増やさない。
 */
public interface OffshoreReviewStrategy {

    boolean supports(ReviewMode mode);

    OffshoreReviewResponse execute(OffshoreReviewRequest request);
}
