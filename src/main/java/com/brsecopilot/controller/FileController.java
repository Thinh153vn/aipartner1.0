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
 * 仕様書PDF／ソーステキストを抽出し、オフショアの仕様比較へ渡す API。
 * フロントは先にここを呼び、取得テキストで /review-offshore（SPEC_DIFF）を実行する。
 */
@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final FileTextExtractionService extractionService;

    public FileController(FileTextExtractionService extractionService) {
        this.extractionService = extractionService;
    }

    /** 単一ファイルからテキストを抽出する。 */
    @PostMapping("/extract-text")
    public ResponseEntity<ExtractedTextResponse> extractText(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(extractionService.extract(file));
    }

    /**
     * 複数ファイルを抽出して結合する（フォルダ選択時）。読めないファイルはスキップし、バッチ全体は失敗させない。
     */
    @PostMapping("/extract-text-batch")
    public ResponseEntity<BatchExtractedTextResponse> extractTextBatch(
            @RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.ok(extractionService.extractBatch(files));
    }
}
