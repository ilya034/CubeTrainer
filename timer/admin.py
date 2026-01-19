from django.contrib import admin
from .models import Discipline, Session, Attempt


@admin.register(Discipline)
class DisciplineAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "scrambler_type")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "user", "discipline", "is_system", "last_activity")
    list_filter = ("discipline", "is_system", "last_activity")
    search_fields = ("user__username", "name")


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "time_ms", "penalty", "created_at")
    list_filter = ("penalty", "created_at")
    search_fields = ("session__user__username",)
