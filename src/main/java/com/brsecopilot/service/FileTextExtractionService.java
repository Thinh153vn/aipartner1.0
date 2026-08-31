package com.brsecopilot.service;

import com.brsecopilot.dto.file.BatchExtractedTextResponse;
import com.brsecopilot.dto.file.ExtractedTextResponse;
import com.brsecopilot.exception.FileExtractionException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * アップロードファイルからテキストを抽出する（仕様比較用）。
 * PDF は PDFBox（テキストPDFのみ。スキャン画像のOCRは対象外）。
 * その他は UTF-8 テキストとして読む。
 * extract は1件で失敗時に即例外。extractBatch は失敗ファイルをスキップして結合する。
 */
@Service
public class FileTextExtractionService {

    private static final Logger log = LoggerFactory.getLogger(FileTextExtractionService.class);

    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024 * 1024; // 1ファイルあたり10MB
    private static final int MAX_TEXT_LENGTH = 3000; // 単一ファイル（仕様書）の上限
    private static final int MAX_BATCH_TEXT_LENGTH = 6000; // 複数ファイル結合後の上限
    // フロントの OFFSHORE_MAX_BATCH_FILES と揃える。表示は大規模でも、AI抽出はこの件数まで。
    private static final int MAX_BATCH_FILE_COUNT = 300;

    /** 1ファイルを抽出し、上限超過時は切り詰めて返す。失敗時は即例外。 */
    public ExtractedTextResponse extract(MultipartFile file) {
        String filename = safeFilename(file);
        log.info("単一ファイルのテキスト抽出を開始します filename={}", filename);

        String rawText = extractRawOrThrow(file, filename);

        boolean truncated = rawText.length() > MAX_TEXT_LENGTH;
        String finalText = truncated ? rawText.substring(0, MAX_TEXT_LENGTH) : rawText;

        log.info("単一ファイルのテキスト抽出が完了しました filename={} truncated={}", filename, truncated);
        return new ExtractedTextResponse(finalText, truncated, filename);
    }

    /** 複数ファイルを結合する。読めないファイルはスキップし、件数上限を超えた分は送らない。 */
    public BatchExtractedTextResponse extractBatch(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new FileExtractionException("ファイルが選択されていません。");
        }

        log.info("複数ファイルのテキスト抽出を開始します requestedCount={}", files.size());

        List<MultipartFile> targetFiles = files.size() > MAX_BATCH_FILE_COUNT
                ? files.subList(0, MAX_BATCH_FILE_COUNT)
                : files;

        List<String> included = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        StringBuilder combined = new StringBuilder();

        for (MultipartFile file : targetFiles) {
            String filename = safeFilename(file);
            try {
                String rawText = extractRawOrThrow(file, filename);
                combined.append("===== ").append(filename).append(" =====\n")
                        .append(rawText.strip())
                        .append("\n\n");
                included.add(filename);
            } catch (FileExtractionException e) {
                log.info("バッチ処理中にファイルをスキップしました filename={} reason={}", filename, e.getMessage());
                skipped.add(filename);
            }
        }

        if (included.isEmpty()) {
            throw new FileExtractionException(
                    "選択されたファイルからテキストを抽出できませんでした。対応形式（PDF/テキスト/コード）をご確認ください。");
        }

        String combinedText = combined.toString();
        boolean truncated = combinedText.length() > MAX_BATCH_TEXT_LENGTH;
        String finalText = truncated ? combinedText.substring(0, MAX_BATCH_TEXT_LENGTH) : combinedText;

        log.info("複数ファイルのテキスト抽出が完了しました includedCount={} skippedCount={} truncated={}",
                included.size(), skipped.size(), truncated);
        return new BatchExtractedTextResponse(finalText, truncated, included.size(), included, skipped);
    }

    private String safeFilename(MultipartFile file) {
        if (file == null) return "unknown";
        String filename = file.getOriginalFilename();
        return (filename != null && !filename.isBlank()) ? filename : "unknown";
    }

    private String extractRawOrThrow(MultipartFile file, String filename) {
        if (file == null || file.isEmpty()) {
            throw new FileExtractionException("「" + filename + "」の内容が空です。");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new FileExtractionException("「" + filename + "」のサイズが上限（10MB）を超えています。");
        }

        String rawText = isPdf(filename, file.getContentType())
                ? extractFromPdf(file, filename)
                : extractFromPlainText(file, filename);

        if (rawText == null || rawText.isBlank()) {
            throw new FileExtractionException(
                    "「" + filename + "」からテキストを抽出できませんでした。画像のみのPDFやバイナリファイルは対応していません。");
        }
        return rawText;
    }

    private boolean isPdf(String filename, String contentType) {
        return filename.toLowerCase().endsWith(".pdf")
                || "application/pdf".equalsIgnoreCase(contentType);
    }

    private String extractFromPdf(MultipartFile file, String filename) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            if (document.isEncrypted()) {
                throw new FileExtractionException(
                        "「" + filename + "」は暗号化されたPDFのため、内容を読み取れませんでした。");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (FileExtractionException e) {
            throw e;
        } catch (IOException e) {
            log.warn("PDFファイルの読み込みに失敗しました filename={} : {}", filename, e.getMessage());
            throw new FileExtractionException(
                    "「" + filename + "」の読み込みに失敗しました。ファイルが破損していないかご確認ください。", e);
        }
    }

    private String extractFromPlainText(MultipartFile file, String filename) {
        try {
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.warn("テキストファイルの読み込みに失敗しました filename={} : {}", filename, e.getMessage());
            throw new FileExtractionException("「" + filename + "」の読み込みに失敗しました。", e);
        }
    }
}
