package io.crimsonledger

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import io.crimsonledger.ui.ImportMode
import io.crimsonledger.ui.LedgerNavHost
import io.crimsonledger.ui.LedgerViewModel
import io.crimsonledger.ui.UndoEffect
import io.crimsonledger.ui.theme.CrimsonLedgerTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {

    private val viewModel: LedgerViewModel by viewModels {
        LedgerViewModel.Factory((application as CrimsonLedgerApp).repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CrimsonLedgerTheme {
                CrimsonLedgerRoot(viewModel = viewModel)
            }
        }
    }
}

@Composable
private fun CrimsonLedgerRoot(viewModel: LedgerViewModel) {
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    var pendingImport by remember { mutableStateOf<String?>(null) }
    // Holds the encoded JSON between launching the SAF "pick a destination"
    // flow and its result callback. Remembered so it survives recomposition
    // but stays scoped to this composition (no top-level global state).
    val pendingExport = remember { mutableStateOf<String?>(null) }

    val exportLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/json"),
    ) { uri: Uri? ->
        val payload = pendingExport.value
        pendingExport.value = null
        if (uri == null || payload == null) return@rememberLauncherForActivityResult
        scope.launch {
            withContext(Dispatchers.IO) {
                context.contentResolver.openOutputStream(uri)?.use { it.write(payload.toByteArray()) }
            }
        }
    }

    val importLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument(),
    ) { uri: Uri? ->
        if (uri == null) return@rememberLauncherForActivityResult
        scope.launch {
            val text = withContext(Dispatchers.IO) {
                context.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() }
            } ?: return@launch
            pendingImport = text
        }
    }

    Scaffold(snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            LedgerNavHost(
                viewModel = viewModel,
                onExportProfile = { id ->
                    viewModel.exportProfile(id)?.let { payload ->
                        pendingExport.value = payload
                        exportLauncher.launch("crimson-ledger-$id.json")
                    }
                },
                onExportAll = {
                    pendingExport.value = viewModel.exportAll()
                    exportLauncher.launch("crimson-ledger.json")
                },
                onImport = { importLauncher.launch(arrayOf("application/json")) },
            )
        }
    }

    UndoEffect(viewModel, snackbar)

    pendingImport?.let { raw ->
        AlertDialog(
            onDismissRequest = { pendingImport = null },
            confirmButton = {
                Button(onClick = { viewModel.importJson(raw, ImportMode.REPLACE); pendingImport = null }) {
                    Text("Replace all")
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.importJson(raw, ImportMode.MERGE); pendingImport = null }) {
                    Text("Merge")
                }
            },
            title = { Text("Import data") },
            text = { Text("Replace your current profiles, or merge imported ones alongside them?") },
        )
    }
}
