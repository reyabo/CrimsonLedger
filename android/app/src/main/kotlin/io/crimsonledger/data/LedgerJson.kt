package io.crimsonledger.data

import io.crimsonledger.domain.ExportEnvelope
import io.crimsonledger.domain.Profile
import kotlinx.serialization.json.Json

/**
 * Versioned envelope matching the web app's export format.
 */
object LedgerJson {
    private val json = Json {
        prettyPrint = true
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    fun encode(profiles: List<Profile>, exportedAt: Long = System.currentTimeMillis()): String =
        json.encodeToString(
            ExportEnvelope.serializer(),
            ExportEnvelope(version = 1, exportedAt = exportedAt, profiles = profiles),
        )

    fun decode(raw: String): ExportEnvelope {
        val envelope = json.decodeFromString(ExportEnvelope.serializer(), raw)
        require(envelope.version == 1) { "Unsupported export version: ${envelope.version}" }
        return envelope
    }
}
