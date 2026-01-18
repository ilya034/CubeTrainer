from django.db import models


class Discipline(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Discipline")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Api name")
    # ToDo icon url

    def __str__(self) -> str:
        return str(self.name)

    class Meta:
        ordering = ["name"]


class Session(models.Model):
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    discipline = models.ForeignKey(Discipline, on_delete=models.CASCADE)

    name = models.CharField(max_length=100, unique=True, verbose_name="Session")
    is_system = models.BooleanField(default=False, verbose_name="Base session")
    last_activity = models.DateTimeField(auto_now=True, verbose_name="Last activity")

    def __str__(self) -> str:
        return str(self.name)

    class Meta:
        ordering = ["last_activity"]
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

    class Meta:
        ordering = ["created_at"]
        unique_together = ["session", "scramble"]
