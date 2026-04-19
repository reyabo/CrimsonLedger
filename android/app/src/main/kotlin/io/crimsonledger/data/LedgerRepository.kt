package io.crimsonledger.data

import io.crimsonledger.domain.Profile
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json

class LedgerRepository(
    private val dao: ProfileDao,
    private val converters: LedgerConverters = LedgerConverters(),
) {
    private val json = Json { ignoreUnknownKeys = true; prettyPrint = true }

    fun observeProfiles(): Flow<List<Profile>> =
        dao.observeAll().map { list -> list.map { it.toDomainWithJson() } }

    fun observeProfile(id: String): Flow<Profile?> =
        dao.observeById(id).map { it?.toDomainWithJson() }

    suspend fun findProfile(id: String): Profile? = dao.findById(id)?.toDomainWithJson()

    suspend fun upsert(profile: Profile) {
        val existing = dao.findById(profile.id)
        val order = existing?.sortOrder ?: (dao.maxSortOrder() + 1)
        dao.insert(profile.toEntityWithJson(order))
    }

    suspend fun delete(id: String) = dao.deleteById(id)

    suspend fun replaceAll(profiles: List<Profile>) {
        val entities = profiles.mapIndexed { idx, p -> p.toEntityWithJson(idx) }
        dao.replaceAll(entities)
    }

    suspend fun merge(profiles: List<Profile>) {
        var order = dao.maxSortOrder()
        profiles.forEach { p ->
            order += 1
            dao.insert(p.toEntityWithJson(order))
        }
    }

    private fun ProfileEntity.toDomainWithJson(): Profile = toDomain(
        conditions = converters.conditionsFromJson(conditionsJson),
        customTrackers = converters.customTrackersFromJson(customTrackersJson),
    )

    private fun Profile.toEntityWithJson(order: Int): ProfileEntity = toEntity(
        conditionsJson = converters.conditionsToJson(conditions),
        customTrackersJson = converters.customTrackersToJson(customTrackers),
        sortOrder = order,
    )

    val jsonFormat: Json get() = json
}
