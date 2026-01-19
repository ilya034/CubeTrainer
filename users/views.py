from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
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

        with transaction.atomic():
            for guest_session in serializer.validated_data["sessions"]:
                disc_slug = guest_session["discipline_slug"]
                sess_name = guest_session["name"]

                discipline = get_object_or_404(Discipline, slug=disc_slug)

                db_session, _ = Session.objects.get_or_create(
                    user=request.user,
                    discipline=discipline,
                    name=sess_name,
                    defaults={
                        "is_system": (sess_name == "General"),
                        "last_activity": timezone.now(),
                    },
                )

                new_solves = []
                for s in guest_session["solves"]:
                    exists = Attempt.objects.filter(
                        session=db_session,
                        created_at=s["created_at"],
                        time_ms=s["time_ms"],
                    ).exists()

                    if not exists:
                        new_solves.append(
                            Attempt(
                                session=db_session,
                                time_ms=s["time_ms"],
                                scramble=s["scramble"],
                                penalty=s["penalty"],
                                created_at=s["created_at"],
                            )
                        )

                Attempt.objects.bulk_create(new_solves)

        return Response({"status": "merged"})
