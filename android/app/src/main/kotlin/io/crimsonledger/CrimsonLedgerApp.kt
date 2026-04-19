package io.crimsonledger

import android.app.Application
import io.crimsonledger.data.LedgerDatabase
import io.crimsonledger.data.LedgerRepository

class CrimsonLedgerApp : Application() {

    val repository: LedgerRepository by lazy {
        LedgerRepository(LedgerDatabase.get(this).profileDao())
    }
}
