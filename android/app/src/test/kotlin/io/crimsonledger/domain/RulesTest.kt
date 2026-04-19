package io.crimsonledger.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class RulesTest {

    @Test
    fun `clamp keeps value inside bounds`() {
        assertEquals(0, clamp(-1, 0, 5))
        assertEquals(5, clamp(9, 0, 5))
        assertEquals(3, clamp(3, 0, 5))
    }

    @Test
    fun `clampTrack enforces max and aggravated displaces superficial`() {
        val t = clampTrack(DamageTrack(max = 5, superficial = 4, aggravated = 4))
        assertEquals(5, t.max)
        assertEquals(4, t.aggravated)
        assertEquals(1, t.superficial)
    }

    @Test
    fun `pipStatesFor orders aggravated first then superficial then empty`() {
        val states = pipStatesFor(DamageTrack(max = 5, superficial = 2, aggravated = 2))
        assertEquals(listOf(
            PipState.AGGRAVATED, PipState.AGGRAVATED,
            PipState.SUPERFICIAL, PipState.SUPERFICIAL,
            PipState.EMPTY,
        ), states)
    }

    @Test
    fun `cycleAt on empty pip adds a superficial`() {
        val track = DamageTrack(max = 5, superficial = 0, aggravated = 0)
        val next = cycleAt(track, 0)
        assertEquals(1, next.superficial)
        assertEquals(0, next.aggravated)
    }

    @Test
    fun `cycleAt on superficial pip promotes it to aggravated`() {
        val track = DamageTrack(max = 5, superficial = 2, aggravated = 0)
        val next = cycleAt(track, 0)  // index 0 is a superficial (no aggravated)
        assertEquals(1, next.superficial)
        assertEquals(1, next.aggravated)
    }

    @Test
    fun `cycleAt on aggravated pip clears it`() {
        val track = DamageTrack(max = 5, superficial = 0, aggravated = 2)
        val next = cycleAt(track, 0)
        assertEquals(0, next.superficial)
        assertEquals(1, next.aggravated)
    }

    @Test
    fun `cycleAt on empty pip between fills adds another superficial`() {
        val track = DamageTrack(max = 5, superficial = 2, aggravated = 0)
        // index 2 is empty (indices 0,1 are superficial; 2,3,4 empty)
        val next = cycleAt(track, 2)
        assertEquals(3, next.superficial)
        assertEquals(0, next.aggravated)
    }

    @Test
    fun `isImpaired true when track is full`() {
        assertTrue(isImpaired(DamageTrack(5, 3, 2)))
        assertFalse(isImpaired(DamageTrack(5, 2, 2)))
    }

    @Test
    fun `isTorpor true when aggravated fills max`() {
        assertTrue(isTorpor(DamageTrack(5, 0, 5)))
        assertFalse(isTorpor(DamageTrack(5, 5, 0)))
    }

    @Test
    fun `hunger severity escalates at thresholds`() {
        assertEquals(Severity.NONE, hungerSeverity(0))
        assertEquals(Severity.NONE, hungerSeverity(3))
        assertEquals(Severity.WARN, hungerSeverity(4))
        assertEquals(Severity.DANGER, hungerSeverity(5))
    }

    @Test
    fun `humanity severity drops at low morality`() {
        assertEquals(Severity.NONE, humanitySeverity(7))
        assertEquals(Severity.WARN, humanitySeverity(4))
        assertEquals(Severity.DANGER, humanitySeverity(2))
    }

    @Test
    fun `degeneration risk when humanity plus stains exceeds max`() {
        assertFalse(atDegenerationRisk(morality = 7, marks = 3))
        assertTrue(atDegenerationRisk(morality = 7, marks = 4))
    }

    @Test
    fun `adjustDamage and clearDamage roundtrip through bounds`() {
        val base = DamageTrack(max = 5, superficial = 1, aggravated = 1)
        val plus = adjustDamage(base, DamageKind.SUPERFICIAL, 10)
        assertEquals(4, plus.superficial) // max - aggravated
        assertEquals(1, plus.aggravated)
        val clean = clearDamage(plus)
        assertEquals(0, clean.superficial)
        assertEquals(0, clean.aggravated)
        assertEquals(5, clean.max)
    }
}
