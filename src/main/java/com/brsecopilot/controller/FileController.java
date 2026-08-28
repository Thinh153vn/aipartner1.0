package com.brsecopilot.controller;

import com.brsecopilot.dto.file.BatchExtractedTextResponse;
import com.brsecopilot.dto.file.ExtractedTextResponse;
import com.brsecopilot.service.FileTextExtractionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST API hỗ trợ upload file (仕様書/design doc dạng PDF, hoặc source code dạng text)
 * để lấy nội dung text, phục vụ tính năng so sánh Spec vs Code (Offshore Support).
 * Frontend gọi endpoint này trước, rồi dùng text trả về để gọi
 * /api/v1/copilot/review-offshore (mode=SPEC_DIFF) như bình thường.
 */
@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final FileTextExtractionService extractionService;

    public FileController(FileTextExtractionService extractionService) {
        this.extractionService = extractionService;
    }

    @PostMapping("/extract-text")
    public ResponseEntity<ExtractedTextResponse> extractText(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(extractionService.extract(file));
    }

    /**
     * Trích xuất + ghép text từ NHIỀU file cùng lúc (dùng khi người dùng chọn cả 1 thư mục
     * project source code). File lỗi/không đọc được sẽ tự bị bỏ qua, không làm fail cả batch.
     */
    @PostMapping("/extract-text-batch")
    public ResponseEntity<BatchExtractedTextResponse> extractTextBatch(
            @RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.ok(extractionService.extractBatch(files));
    }
}
