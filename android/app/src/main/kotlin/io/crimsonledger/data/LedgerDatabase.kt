package io.crimsonledger.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

@Database(
    entities = [ProfileEntity::class],
    version = 1,
    exportSchema = false,
)
@TypeConverters(LedgerConverters::class)
abstract class LedgerDatabase : RoomDatabase() {
    abstract fun profileDao(): ProfileDao

    companion object {
        @Volatile private var instance: LedgerDatabase? = null

        fun get(context: Context): LedgerDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    LedgerDatabase::class.java,
                    "crimson_ledger.db",
                ).fallbackToDestructiveMigrationOnDowngrade(dropAllTables = true)
                    .build().also { instance = it }
            }
    }
}
