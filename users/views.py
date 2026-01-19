from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from django.shortcuts import get_object_or_404
from timer.models import Discipline, Session, Attempt
from .serializers import SyncDataSerializer


class SyncGuestDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SyncDataSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        user = request.user

        try:
            with transaction.atomic():
                for session_data in data["sessions"]:
                    discipline = get_object_or_404(
                        Discipline, slug=session_data["discipline_slug"]
                    )

                    session, created = Session.objects.get_or_create(
                        user=user,
                        discipline=discipline,
                        name=session_data["name"],
                        defaults={"is_system": (session_data["name"] == "General")},
                    )

                    attempts_to_create = []
                    for solve in session_data["solves"]:
                        attempts_to_create.append(
                            Attempt(
                                session=session,
                                time_ms=solve["time_ms"],
                                scramble=solve["scramble"],
                                penalty=solve.get("penalty", "0"),
                                created_at=solve["created_at"],
                            )
                        )

                    Attempt.objects.bulk_create(attempts_to_create)

                    if attempts_to_create:
                        last_solve = sorted(
                            attempts_to_create, key=lambda x: x.created_at
                        )[-1]
                        session.last_activity = last_solve.created_at
                        session.save()

            return Response(
                {"status": "synced", "message": "Guest data imported successfully"}
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
