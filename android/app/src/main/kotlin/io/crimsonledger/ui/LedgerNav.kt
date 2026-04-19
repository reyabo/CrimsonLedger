package io.crimsonledger.ui

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import io.crimsonledger.ui.screens.DashboardScreen
import io.crimsonledger.ui.screens.ProfileScreen

object Routes {
    const val DASHBOARD = "dashboard"
    const val PROFILE = "profile/{id}"
    fun profile(id: String) = "profile/$id"
}

@Composable
fun LedgerNavHost(
    viewModel: LedgerViewModel,
    onExportProfile: (String) -> Unit,
    onExportAll: () -> Unit,
    onImport: () -> Unit,
) {
    val nav = rememberNavController()
    NavHost(navController = nav, startDestination = Routes.DASHBOARD) {
        composable(Routes.DASHBOARD) {
            DashboardScreen(
                viewModel = viewModel,
                onOpenProfile = { id -> nav.navigate(Routes.profile(id)) },
                onOpenImport = onImport,
                onExportAll = onExportAll,
            )
        }
        composable(
            route = Routes.PROFILE,
            arguments = listOf(navArgument("id") { type = NavType.StringType }),
        ) { backStack ->
            val id = backStack.arguments?.getString("id").orEmpty()
            ProfileScreen(
                profileId = id,
                viewModel = viewModel,
                onBack = { nav.popBackStack() },
                onExport = onExportProfile,
            )
        }
    }
}
