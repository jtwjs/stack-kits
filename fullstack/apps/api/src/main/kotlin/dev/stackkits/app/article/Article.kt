package dev.stackkits.app.article

import dev.stackkits.app.common.DomainException
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.springframework.http.HttpStatus
import java.time.Instant

@Entity
@Table(name = "article")
class Article(
    @Column(nullable = false, length = 200)
    var title: String,
    @Column(nullable = false, columnDefinition = "TEXT")
    var body: String,
) {
    // 저장 전에는 PK 가 없다 — 엔티티의 ? 는 이 JPA 사정뿐이다. DTO 로 옮길 때 한 번 푼다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null

    @Enumerated(EnumType.STRING) // ORDINAL 은 enum 순서가 바뀌면 기존 행이 조용히 틀어진다
    @Column(nullable = false, length = 20)
    var status: ArticleStatus = ArticleStatus.DRAFT
        protected set

    var publishedAt: Instant? = null
        protected set

    @Column(nullable = false)
    val createdAt: Instant = Instant.now()

    fun publish(now: Instant) {
        if (!status.canMoveTo(ArticleStatus.PUBLISHED)) throw IllegalTransitionException(status, ArticleStatus.PUBLISHED)
        status = ArticleStatus.PUBLISHED
        publishedAt = now
    }
}

enum class ArticleStatus {
    DRAFT,
    PUBLISHED,
    ;

    // 허용 전이표. 여기 없는 전이는 409.
    fun canMoveTo(next: ArticleStatus): Boolean =
        when (this) {
            DRAFT -> next == PUBLISHED
            PUBLISHED -> false
        }
}

class IllegalTransitionException(
    from: ArticleStatus,
    to: ArticleStatus,
) : DomainException(HttpStatus.CONFLICT, "article cannot move from $from to $to")
