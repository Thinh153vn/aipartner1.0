package com.brsecopilot.service.offshore;

import com.brsecopilot.dto.offshore.OffshoreReviewRequest;
import com.brsecopilot.dto.offshore.OffshoreReviewResponse;
import com.brsecopilot.dto.offshore.ReviewMode;

/**
 * Strategy Pattern cho endpoint /api/v1/copilot/review-offshore.
 *
 * Trước đây 2 nhánh nghiệp vụ (SPEC_DIFF / SHADOW_CLIENT) được rẽ bằng chuỗi
 * if/else theo {@link ReviewMode} ngay trong Service, khiến việc thêm 1 mode
 * review mới (ví dụ trong tương lai) bắt buộc phải sửa lại method cũ (vi phạm
 * Open/Closed Principle). Thay vào đó, mỗi mode được cài đặt thành 1
 * OffshoreReviewStrategy riêng biệt, tự khai báo mode mình hỗ trợ; muốn thêm
 * mode mới chỉ cần thêm 1 class implements interface này, không đụng vào code cũ.
 */
public interface OffshoreReviewStrategy {

    boolean supports(ReviewMode mode);

    OffshoreReviewResponse execute(OffshoreReviewRequest request);
}
