package dev.stackkits.app

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import tools.jackson.databind.SerializationFeature
import tools.jackson.databind.json.JsonMapper
import java.nio.file.Files
import java.nio.file.Path
import kotlin.test.assertEquals

// contracts/openapi.json 은 프론트가 타입을 생성하는 계약이다. 생성물이지만 커밋한다.
// API 를 바꿨으면: UPDATE_CONTRACTS=1 ./gradlew test --tests '*OpenApiContractTest' 로 다시 쓰고 같이 커밋한다.
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration::class)
class OpenApiContractTest(
    @Autowired private val mockMvc: MockMvc,
) {
    private val file = Path.of("contracts/openapi.json")
    private val mapper = JsonMapper.builder().enable(SerializationFeature.INDENT_OUTPUT).build()

    @Test
    fun `생성된 스펙이 커밋된 contracts_openapi_json 과 같다`() {
        val raw =
            mockMvc
                .get("/v3/api-docs")
                .andReturn()
                .response.contentAsString
        val actual = mapper.writeValueAsString(mapper.readTree(raw)) + "\n"

        if (System.getenv("UPDATE_CONTRACTS") == "1") {
            Files.createDirectories(file.parent)
            Files.writeString(file, actual)
            return
        }
        check(Files.exists(file)) { "contracts/openapi.json 없음 — UPDATE_CONTRACTS=1 로 생성 후 커밋" }
        assertEquals(Files.readString(file), actual, "API 계약 드리프트 — 의도한 변경이면 UPDATE_CONTRACTS=1 로 재생성 후 커밋")
    }
}
