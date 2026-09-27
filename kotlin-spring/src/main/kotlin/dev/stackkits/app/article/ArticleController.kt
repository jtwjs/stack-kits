package dev.stackkits.app.article

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
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
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @Valid @RequestBody req: CreateArticleRequest,
    ): ArticleResponse =
        // @Valid 를 통과했으니 null 이 아니다 — 요청 경계에서 한 번만 푼다
        articleService.create(title = requireNotNull(req.title), body = requireNotNull(req.body))

    @Operation(summary = "기사 조회")
    @GetMapping("/{id}")
    fun get(
        @PathVariable id: Long,
    ): ArticleResponse = articleService.get(id)

    @Operation(summary = "기사 발행 — 초안만 가능, 아니면 409")
    @PostMapping("/{id}/publish")
    fun publish(
        @PathVariable id: Long,
    ): ArticleResponse = articleService.publish(id)
}
