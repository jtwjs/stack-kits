package dev.stackkits.app.article

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@Tag(name = "기사")
@RestController
@RequestMapping("/api/articles")
class ArticleController(
    private val articleService: ArticleService,
) {
    @Operation(summary = "기사 작성 (초안)")
    @ApiResponse(
        responseCode = "400",
        description = "검증 실패",
        content = [Content(mediaType = PROBLEM, schema = Schema(implementation = ProblemDetail::class))],
    )
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @Valid @RequestBody req: CreateArticleRequest,
    ): ArticleResponse =
        // @Valid 를 통과했으니 null 이 아니다 — 요청 경계에서 한 번만 푼다
        articleService.create(title = requireNotNull(req.title), body = requireNotNull(req.body))

    @Operation(summary = "기사 목록 — 최신순")
    @GetMapping
    fun list(): List<ArticleResponse> = articleService.list()

    @Operation(summary = "기사 조회")
    @ApiResponse(
        responseCode = "404",
        description = "없는 기사",
        content = [Content(mediaType = PROBLEM, schema = Schema(implementation = ProblemDetail::class))],
    )
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK) // 에러 @ApiResponse 를 달면 springdoc 이 기본 200 을 빼므로 명시
    fun get(
        @PathVariable id: Long,
    ): ArticleResponse = articleService.get(id)

    @Operation(summary = "기사 발행 — 초안만 가능, 아니면 409")
    @ApiResponse(
        responseCode = "404",
        description = "없는 기사",
        content = [Content(mediaType = PROBLEM, schema = Schema(implementation = ProblemDetail::class))],
    )
    @ApiResponse(
        responseCode = "409",
        description = "허용되지 않은 전이",
        content = [Content(mediaType = PROBLEM, schema = Schema(implementation = ProblemDetail::class))],
    )
    @PostMapping("/{id}/publish")
    @ResponseStatus(HttpStatus.OK)
    fun publish(
        @PathVariable id: Long,
    ): ArticleResponse = articleService.publish(id)
}

// 에러 응답(ErrorHandler 가 내는 ProblemDetail)을 계약에 드러낸다 — 프론트가 에러 모양도 생성 타입으로 받는다
private const val PROBLEM = "application/problem+json"
