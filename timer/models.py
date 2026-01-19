from django.db import models
from django.forms import ValidationError
from django.utils import timezone


class Discipline(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Discipline")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Api name")
    scrambler = models.CharField(
        max_length=50, default="333", verbose_name="Scrambler type"
    )
    # ToDo icon url

    def __str__(self) -> str:
        return str(self.name)

    class Meta:
        ordering = ["name"]


class Session(models.Model):
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    discipline = models.ForeignKey(Discipline, on_delete=models.CASCADE)

    name = models.CharField(max_length=100, verbose_name="Session", blank=True)
    is_system = models.BooleanField(default=False, verbose_name="Base session")
    last_activity = models.DateTimeField(auto_now=True, verbose_name="Last activity")

    def __str__(self) -> str:
        return str(self.name)

    def clean(self):
        if not self.is_system and not self.name:
            raise ValidationError({"name": "Name is required for non-system sessions."})

    def save(self, *args, **kwargs):
        if self.is_system and not self.name:
            self.name = "General"

        if not self.name:
            self.last_activity = timezone.now()

        super().save(*args, **kwargs)

    class Meta:
        ordering = ["-last_activity"]
        unique_together = ["user", "discipline", "name"]


class Attempt(models.Model):
    class PenaltyChoices(models.TextChoices):
        NO_PENALTY = "0", "No penalty"
        PLUS_2 = "2", "+2"
        DNF = "DNF", "DNF"

    session = models.ForeignKey(Session, on_delete=models.CASCADE)

    time_ms = models.PositiveIntegerField(verbose_name="Time in milliseconds")
    scramble = models.CharField(max_length=255, verbose_name="Scramble")
    penalty = models.CharField(
        max_length=3,
        choices=PenaltyChoices.choices,
        default=PenaltyChoices.NO_PENALTY,
        verbose_name="Penalty",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created at")

    comment = models.TextField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Comment",
        help_text="Optional user comment for this attempt",
    )

    def save(self, *args, **kwargs):
        self.session.last_activity = timezone.now()
        self.session.save(update_fields=["last_activity"])
        super().save(*args, **kwargs)

    @property
    def time_with_penalty(self):
        if self.penalty == self.PenaltyChoices.DNF:
            return float("inf")
        if self.penalty == self.PenaltyChoices.PLUS_2:
            return self.time_ms + 2000
        return self.time_ms

    class Meta:
        ordering = ["-created_at"]
