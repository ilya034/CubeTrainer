from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Discipline, Session, Attempt
from .serializers import DisciplineSerializer, SessionSerializer, AttemptSerializer


class DisciplineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Discipline.objects.all()
    serializer_class = DisciplineSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Session.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        discipline_slug = self.request.data.get("discipline_slug")
        discipline = get_object_or_404(Discipline, slug=discipline_slug)
        serializer.save(user=self.request.user, discipline=discipline)

    @action(
        detail=False, methods=["GET"], url_path="current/(?P<discipline_slug>[^/.]+)"
    )
    def current(self, request, discipline_slug=None):
        """
        Smart Switching: Возвращает последнюю активную сессию для дисциплины.
        Если нет - создает "General".
        Пример: GET /api/sessions/current/333/
        """
        user = request.user
        discipline = get_object_or_404(Discipline, slug=discipline_slug)

        session = Session.objects.filter(user=user, discipline=discipline).first()

        if not session:
            session = Session.objects.create(
                user=user, discipline=discipline, name="General", is_system=True
            )

        serializer = self.get_serializer(session)
        return Response(serializer.data)


class AttemptViewSet(viewsets.ModelViewSet):
    serializer_class = AttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # ToDo фильтр по session_id через query params(?)
        queryset = Attempt.objects.filter(session__user=self.request.user)
        session_id = self.request.query_params.get("session_id")
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        return queryset

    def perform_create(self, serializer):
        session_id = self.request.data.get("session_id")
        session = get_object_or_404(Session, id=session_id, user=self.request.user)
        serializer.save(session=session)
