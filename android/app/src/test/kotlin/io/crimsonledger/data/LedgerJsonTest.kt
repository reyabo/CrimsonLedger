package io.crimsonledger.data

import io.crimsonledger.domain.CustomTracker
import io.crimsonledger.domain.CustomTrackerDisplay
import io.crimsonledger.domain.DamageTrack
import io.crimsonledger.domain.Profile
import org.junit.Assert.assertEquals
import org.junit.Test

class LedgerJsonTest {

    private fun sample(id: String = "p-1") = Profile(
        id = id,
        name = "Rook",
        chronicle = "Chicago by Night",
        thirst = 2,
        morality = 7,
        marks = 1,
        health = DamageTrack(6, 1, 2),
        willpower = DamageTrack(5, 1, 0),
        conditions = emptyList(),
        customTrackers = listOf(CustomTracker("t1", "Dice bonus", 3, 5, CustomTrackerDisplay.PIPS)),
        shortNotes = "hunting tonight",
        archived = false,
        createdAt = 100,
        updatedAt = 200,
    )

    @Test
    fun `encode decode roundtrip preserves profiles`() {
        val original = listOf(sample(), sample("p-2").copy(name = "Vessel"))
        val encoded = LedgerJson.encode(original, exportedAt = 999)
        val decoded = LedgerJson.decode(encoded)
        assertEquals(1, decoded.version)
        assertEquals(999L, decoded.exportedAt)
        assertEquals(original, decoded.profiles)
    }

    @Test(expected = IllegalArgumentException::class)
    fun `decode rejects unsupported version`() {
        LedgerJson.decode("""{"version":2,"exportedAt":0,"profiles":[]}""")
    }
}
