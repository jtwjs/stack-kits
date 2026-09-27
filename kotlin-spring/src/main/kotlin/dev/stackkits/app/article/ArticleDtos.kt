package dev.stackkits.app.article

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant

data class CreateArticleRequest(
    // 요청 DTO 는 ? + @NotBlank: 필드가 빠져도 역직렬화 예외가 아니라 검증 메시지와 함께 400 이 나간다.
    // @field: 가 없어도 되는 것은 build.gradle.kts 의 -Xannotation-default-target=param-property 덕분이다(빼면 검증이 조용히 사라진다).
    @Schema(description = "제목")
    @NotBlank
    @Size(max = 200)
    val title: String? = null,
    @Schema(description = "본문")
    @NotBlank
    val body: String? = null,
)

data class ArticleResponse(
    @Schema(description = "기사 ID") val id: Long,
    @Schema(description = "제목") val title: String,
    @Schema(description = "상태") val status: ArticleStatus,
    // 응답 DTO 의 ? 는 비즈니스상 비어 있을 수 있을 때만
    @Schema(description = "발행 시각. 미발행이면 null") val publishedAt: Instant?, // springdoc 3.x 가 nullable 로 옮긴다
) {
    companion object {
        fun from(article: Article) =
            ArticleResponse(
                id = requireNotNull(article.id) { "저장되지 않은 기사" },
                title = article.title,
                status = article.status,
                publishedAt = article.publishedAt,
            )
    }
}
