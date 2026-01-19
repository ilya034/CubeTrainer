from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import SimpleRouter
from timer.views import DisciplineViewSet, SessionViewSet, AttemptViewSet
from users.views import SyncGuestDataView
from analytics.views import StatsView

router_v1 = SimpleRouter()
router_v1.register(r"disciplines", DisciplineViewSet)
router_v1.register(r"sessions", SessionViewSet, basename="session")
router_v1.register(r"solves", AttemptViewSet, basename="solve")

api_v1_patterns = [
    path("", include(router_v1.urls)),
    path("stats/<int:session_id>/", StatsView.as_view(), name="session-stats"),
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.authtoken")),
    path("sync/", SyncGuestDataView.as_view(), name="sync-guest-data"),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1_patterns)),
]
