package dev.stackkits.app.common

import org.springframework.http.HttpStatus

// 도메인 예외의 바탕. 도메인 패키지는 이걸 상속하고, ErrorHandler 는 이것만 안다(common → 도메인 의존 없음).
open class DomainException(
    val status: HttpStatus,
    message: String,
) : RuntimeException(message)
