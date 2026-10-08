# kotlin-spring kit

Spring Boot 4.1 · Kotlin 2.3 · JDK 21 · MySQL 8.4 보일러플레이트.

```bash
./gradlew bootRun   # Docker 가 떠 있으면 compose.yaml 의 MySQL 을 자동 기동한다
```

Swagger UI: http://localhost:8080/swagger-ui.html

## 검증 명령

| 단계 | 명령 | 비고 |
|---|---|---|
| format | `./gradlew ktlintCheck` | 고치기는 `./gradlew ktlintFormat` |
| lint | — | detekt는 Kotlin 2.3 안정판 미지원 |
| typecheck | `./gradlew compileKotlin compileTestKotlin` | |
| test | `./gradlew test` | Docker 필요(Testcontainers MySQL). 계약 스냅샷 테스트 포함 |
| build | `./gradlew build -x test` | `-x`는 그래프 전체에서 test를 빼므로 test와 한 명령에 섞지 않는다 |
| e2e | — | |

- JDK 21이 필요하다. 기본 java가 다르면 `JAVA_HOME`을 21로 지정해 실행한다.
- API를 바꿨으면 `UPDATE_CONTRACTS=1 ./gradlew test --tests '*OpenApiContractTest'`로 `contracts/openapi.json`을 다시 쓰고 같이 커밋한다.

## 에러 응답

`common/ErrorHandler`가 모든 에러를 RFC 9457 ProblemDetail(`application/problem+json`)로 낸다. 도메인 예외는 `common/DomainException(status)`을 상속하고, ErrorHandler는 도메인 패키지를 모른다. 400 검증 실패도 같은 모양이다(`ResponseEntityExceptionHandler` 상속).

## 예시 도메인(article) 제거 체크리스트

- [ ] `src/main/kotlin/dev/stackkits/app/article/` 삭제 (`Article.kt` · `ArticleController.kt` · `ArticleDtos.kt` · `ArticleRepository.kt` · `ArticleService.kt`)
- [ ] `src/test/kotlin/dev/stackkits/app/article/` 삭제 (`ArticleApiTest.kt` · `ArticleServiceTest.kt`). `X-Request-Id` 헤더 단언이 여기 있었으니 첫 API 테스트에 옮긴다
- [ ] `src/main/resources/db/migration/V1__create_article.sql` 삭제 후 첫 테이블로 `V1__*.sql`을 새로 쓴다 (어디에도 적용된 적 없을 때만. 적용됐으면 `V2`로 drop)
- [ ] `http/article.http` 삭제
- [ ] `contracts/openapi.json` 재생성: `UPDATE_CONTRACTS=1 ./gradlew test --tests '*OpenApiContractTest'`
- [ ] `common/ErrorHandler.kt` · `ArchitectureTest.kt`는 고칠 것 없음 (ErrorHandler는 `DomainException`만 알고, ArchUnit 규칙은 `allowEmptyShould(true)`라 대상 0개여도 통과)
- [ ] `./gradlew build`로 확인
