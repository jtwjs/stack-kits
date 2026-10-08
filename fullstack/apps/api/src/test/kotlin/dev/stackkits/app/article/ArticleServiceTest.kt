package dev.stackkits.app.article

import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.Optional
import kotlin.test.assertEquals

class ArticleServiceTest {
    private val repository = mockk<ArticleRepository>()
    private val now = Instant.parse("2026-01-01T00:00:00Z")
    private val service = ArticleService(repository, Clock.fixed(now, ZoneOffset.UTC))

    @Nested
    inner class `발행` {
        @Test
        fun `초안은 발행되고 발행 시각이 찍힌다`() {
            val article = saved(Article(title = "t", body = "b"))
            every { repository.findById(1L) } returns Optional.of(article)

            val res = service.publish(1L)

            assertEquals(ArticleStatus.PUBLISHED, res.status)
            assertEquals(now, res.publishedAt)
        }

        @Test
        fun `이미 발행된 기사는 다시 발행할 수 없다`() {
            val article = saved(Article(title = "t", body = "b")).apply { publish(now) }
            every { repository.findById(1L) } returns Optional.of(article)

            assertThrows<IllegalTransitionException> { service.publish(1L) }
        }

        @Test
        fun `없는 기사는 NotFound`() {
            every { repository.findById(9L) } returns Optional.empty()

            assertThrows<ArticleNotFoundException> { service.publish(9L) }
        }
    }

    // 단위 테스트에서는 DB 가 id 를 채우지 않으니 리플렉션으로 넣는다
    private fun saved(article: Article): Article =
        article.also { a ->
            Article::class.java
                .getDeclaredField("id")
                .apply { isAccessible = true }
                .set(a, 1L)
        }
}
