package io.crimsonledger.ui

import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue

@Composable
fun UndoEffect(viewModel: LedgerViewModel, snackbarHostState: SnackbarHostState) {
    val undo by viewModel.undo.collectAsState()
    val snapshot = undo ?: return

    LaunchedEffect(snapshot.takenAt) {
        val result = snackbarHostState.showSnackbar(
            message = "Change saved",
            actionLabel = "Undo",
            withDismissAction = true,
        )
        when (result) {
            SnackbarResult.ActionPerformed -> viewModel.performUndo()
            SnackbarResult.Dismissed -> viewModel.dismissUndo()
        }
    }
}
