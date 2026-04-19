package io.crimsonledger.data

import androidx.room.TypeConverter
import io.crimsonledger.domain.Condition
import io.crimsonledger.domain.CustomTracker
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json

class LedgerConverters {
    private val json = Json { ignoreUnknownKeys = true }

    @TypeConverter
    fun conditionsFromJson(value: String): List<Condition> =
        if (value.isBlank()) emptyList()
        else json.decodeFromString(ListSerializer(Condition.serializer()), value)

    @TypeConverter
    fun conditionsToJson(value: List<Condition>): String =
        json.encodeToString(ListSerializer(Condition.serializer()), value)

    @TypeConverter
    fun customTrackersFromJson(value: String): List<CustomTracker> =
        if (value.isBlank()) emptyList()
        else json.decodeFromString(ListSerializer(CustomTracker.serializer()), value)

    @TypeConverter
    fun customTrackersToJson(value: List<CustomTracker>): String =
        json.encodeToString(ListSerializer(CustomTracker.serializer()), value)
}
