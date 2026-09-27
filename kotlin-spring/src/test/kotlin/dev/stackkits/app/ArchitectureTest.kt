package dev.stackkits.app

import com.tngtech.archunit.core.importer.ImportOption
import com.tngtech.archunit.junit.AnalyzeClasses
import com.tngtech.archunit.junit.ArchTest
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses

// 레이어 규칙은 문서가 아니라 테스트로 지킨다
@AnalyzeClasses(packages = ["dev.stackkits.app"], importOptions = [ImportOption.DoNotIncludeTests::class])
class ArchitectureTest {
    @ArchTest
    val controllersDoNotUseRepositories = // 컨트롤러는 리포지토리를 직접 쓰지 않는다
        noClasses()
            .that()
            .haveSimpleNameEndingWith("Controller")
            .should()
            .dependOnClassesThat()
            .haveSimpleNameEndingWith("Repository")

    @ArchTest
    val servicesDoNotDependOnWeb = // 서비스는 웹 계층에 의존하지 않는다
        noClasses()
            .that()
            .haveSimpleNameEndingWith("Service")
            .should()
            .dependOnClassesThat()
            .resideInAPackage("org.springframework.web..")
}
