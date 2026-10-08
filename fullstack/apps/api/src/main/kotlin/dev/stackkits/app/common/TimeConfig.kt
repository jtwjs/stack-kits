package dev.stackkits.app.common

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Clock

@Configuration
class TimeConfig {
    // 시각은 Clock 으로 주입해 테스트에서 고정한다
    @Bean
    fun clock(): Clock = Clock.systemUTC()
}
