# Keep kotlinx.serialization metadata for Profile/envelope models used at runtime.
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

-keep,includedescriptorclasses class io.crimsonledger.**$$serializer { *; }
-keepclassmembers class io.crimsonledger.** {
    *** Companion;
}
-keepclasseswithmembers class io.crimsonledger.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# Room generated classes
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
-dontwarn androidx.room.paging.**
