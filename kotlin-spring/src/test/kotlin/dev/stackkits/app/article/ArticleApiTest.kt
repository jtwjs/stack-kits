package dev.stackkits.app.article

import dev.stackkits.app.TestcontainersConfiguration
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

// 실제 MySQL(Testcontainers) + Flyway 로 한 흐름을 끝까지. H2 는 쓰지 않는다
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration::class)
class ArticleApiTest(
    @Autowired private val mockMvc: MockMvc,
) {
    @Test
    fun `작성 → 조회 → 발행 → 재발행은 409`() {
        val location =
            mockMvc
                .post("/api/articles") {
                    contentType = MediaType.APPLICATION_JSON
                    content = """{"title":"첫 기사","body":"본문"}"""
                }.andExpect {
                    status { isCreated() }
                    jsonPath("$.status") { value("DRAFT") }
                    header { exists("X-Request-Id") }
                }.andReturn()
                .response.contentAsString
        val id = Regex(""""id":(\d+)""").find(location)!!.groupValues[1]

        mockMvc.get("/api/articles/$id").andExpect { status { isOk() } }
        mockMvc.post("/api/articles/$id/publish").andExpect {
            status { isOk() }
            jsonPath("$.status") { value("PUBLISHED") }
        }
        mockMvc.post("/api/articles/$id/publish").andExpect { status { isConflict() } }
    }

    @Test
    fun `필수 필드가 빠지면 400`() {
        mockMvc
            .post("/api/articles") {
                contentType = MediaType.APPLICATION_JSON
                content = """{"title":""}"""
            }.andExpect { status { isBadRequest() } }
    }

    @Test
    fun `없는 기사는 404`() {
        mockMvc.get("/api/articles/999999").andExpect { status { isNotFound() } }
    }
}
