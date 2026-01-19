from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from timer.models import Session, Attempt


class StatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_object_or_404(Session, id=session_id, user=request.user)

        attempts = Attempt.objects.filter(session=session)[:12]
        data = {
            "session_name": session.name,
            "mean": self.calculate_mean(attempts),
            "ao5": self.calculate_average(attempts[:5]),
            "ao12": self.calculate_average(attempts[:12]),
        }
        return Response(data)

    def calculate_mean(self, attempts):
        if not attempts:
            return 0
        valid_times = [a.final_time for a in attempts if a.penalty != "DNF"]
        if not valid_times:
            return 0
        return round(sum(valid_times) / len(valid_times))

    def calculate_average(self, attempts):
        if len(attempts) < 3:
            return None

        times = [a.final_time for a in attempts]

        dnf_count = times.count(float("inf"))
        if dnf_count > 1:
            return "DNF"

        times.sort()
        trimmed = times[1:-1]

        avg = sum(trimmed) / len(trimmed)
        return round(avg)
