package dev.stackkits.app.common

import io.swagger.v3.core.converter.AnnotatedType
import io.swagger.v3.core.converter.ModelConverter
import io.swagger.v3.core.converter.ModelConverterContext
import io.swagger.v3.core.util.Json
import io.swagger.v3.oas.models.media.Schema
import org.springframework.stereotype.Component
import kotlin.reflect.full.memberProperties

/**
 * Kotlin non-null 속성을 OpenAPI `required` 로 표시한다.
 *
 * springdoc 3.x 는 `String?` 를 nullable 로는 옮기지만(KotlinNullablePropertyCustomizer),
 * `String` 을 required 로는 옮기지 않는다 — 그대로 두면 orval 이 모든 응답 필드를 선택(`?:`)으로 만든다.
 * 프론트 타입이 Kotlin 타입과 같아지도록 non-null 속성을 required 에 넣는다.
 */
@Component
class KotlinRequiredSchemaConverter : ModelConverter {
    override fun resolve(
        type: AnnotatedType,
        context: ModelConverterContext,
        chain: Iterator<ModelConverter>,
    ): Schema<*>? {
        if (!chain.hasNext()) return null
        val resolved = chain.next().resolve(type, context, chain)
        val raw = runCatching { Json.mapper().constructType(type.type).rawClass }.getOrNull() ?: return resolved
        if (raw.packageName.startsWith("java.") || raw.isEnum || raw.getAnnotation(Metadata::class.java) == null) return resolved

        val target = resolved?.`$ref`?.let { context.definedModels[it.substringAfterLast('/')] } ?: resolved
        val props = target?.properties ?: return resolved
        runCatching { raw.kotlin.memberProperties }.getOrNull()?.forEach { prop ->
            if (!prop.returnType.isMarkedNullable && props.containsKey(prop.name) && target.required?.contains(prop.name) != true) {
                target.addRequiredItem(prop.name)
            }
        }
        return resolved
    }
}
