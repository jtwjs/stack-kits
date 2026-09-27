package dev.stackkits.app.common

import dev.stackkits.app.article.ArticleNotFoundException
import dev.stackkits.app.article.IllegalTransitionException
import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

// 에러 응답은 한 곳에서 같은 모양(RFC 9457 ProblemDetail)으로
@RestControllerAdvice
class ErrorHandler {
    @ExceptionHandler(ArticleNotFoundException::class)
    fun notFound(e: ArticleNotFoundException): ProblemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message)

    @ExceptionHandler(IllegalTransitionException::class)
    fun conflict(e: IllegalTransitionException): ProblemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.message)
}
