from rest_framework import serializers
from .models import Discipline, Session, Attempt


class DisciplineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discipline
        fields = ["id", "name", "slug", "scrambler_type"]


class AttemptSerializer(serializers.ModelSerializer):
    final_time_display = serializers.SerializerMethodField()

    class Meta:
        model = Attempt
        fields = [
            "id",
            "time_ms",
            "scramble",
            "penalty",
            "comment",
            "created_at",
            "final_time_display",
        ]
        read_only_fields = ["created_at"]

    def get_time_with_penalty(self, obj):
        if obj.penalty == "DNF":
            return "DNF"
        val = obj.time_ms
        if obj.penalty == "2":
            val += 2000
        return val


class SessionSerializer(serializers.ModelSerializer):
    discipline_slug = serializers.CharField(source="discipline.slug", read_only=True)
    solve_count = serializers.IntegerField(source="attempts.count", read_only=True)

    class Meta:
        model = Session
        fields = [
            "id",
            "name",
            "is_system",
            "last_activity",
            "discipline_slug",
            "solve_count",
        ]
        read_only_fields = ["user", "last_activity", "is_system"]
