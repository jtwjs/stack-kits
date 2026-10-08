package dev.stackkits.app.article

import dev.stackkits.app.common.DomainException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Clock
import java.time.Instant

@Service
class ArticleService(
    private val articleRepository: ArticleRepository,
    private val clock: Clock,
) {
    @Transactional
    fun create(
        title: String,
        body: String,
    ): ArticleResponse = ArticleResponse.from(articleRepository.save(Article(title = title, body = body)))

    @Transactional(readOnly = true)
    fun get(id: Long): ArticleResponse = ArticleResponse.from(find(id))

    @Transactional
    fun publish(id: Long): ArticleResponse {
        val article = find(id)
        article.publish(Instant.now(clock)) // 변경 감지로 커밋 때 UPDATE
        return ArticleResponse.from(article)
    }

    private fun find(id: Long): Article = articleRepository.findByIdOrNull(id) ?: throw ArticleNotFoundException(id)
}

class ArticleNotFoundException(
    id: Long,
) : DomainException(HttpStatus.NOT_FOUND, "article $id not found")
