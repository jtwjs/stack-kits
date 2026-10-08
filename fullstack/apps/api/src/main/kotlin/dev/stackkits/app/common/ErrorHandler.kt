package dev.stackkits.app.common

import org.springframework.http.ProblemDetail
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

// 에러 응답은 한 곳에서 같은 모양(RFC 9457 ProblemDetail, application/problem+json)으로.
// spring.mvc.problemdetails.enabled(기본 false) 대신 상속을 택했다: 설정 한 줄에 숨지 않고 이 클래스 하나에 다 보이며,
// 이 빈이 있으면 Boot 의 ProblemDetailsExceptionHandler 는 물러난다(@ConditionalOnMissingBean). 400 검증 실패도 여기로 온다.
@RestControllerAdvice
class ErrorHandler : ResponseEntityExceptionHandler() {
    @ExceptionHandler(DomainException::class)
    fun domain(e: DomainException): ProblemDetail = ProblemDetail.forStatusAndDetail(e.status, e.message)
}
