from rest_framework import serializers


class GuestSolveSerializer(serializers.Serializer):
    time_ms = serializers.IntegerField()
    scramble = serializers.CharField()
    penalty = serializers.CharField(default="0")
    created_at = serializers.DateTimeField()


class GuestSessionSerializer(serializers.Serializer):
    name = serializers.CharField()
    discipline_slug = serializers.CharField()
    solves = GuestSolveSerializer(many=True)


class SyncDataSerializer(serializers.Serializer):
    sessions = GuestSessionSerializer(many=True)
