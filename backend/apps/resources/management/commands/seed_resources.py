
from django.core.management.base import BaseCommand
from apps.resources.models import Resource

class Command(BaseCommand):
    help = 'Seeds initial resources data'

    def handle(self, *args, **kwargs):
        resources = [
            {
                "name": "Grande Salle de Prière",
                "type": "ROOM",
                "description": "Salle principale pour les prières et grands événements.",
                "capacity": 500,
                "is_available": True
            },
            {
                "name": "Salle de Conférence A",
                "type": "ROOM",
                "description": "Salle équipée pour réunions et cours.",
                "capacity": 30,
                "is_available": True
            },
            {
                "name": "Projecteur Vidéo HD",
                "type": "EQUIPMENT",
                "description": "Projecteur portable haute définition avec écran.",
                "capacity": None,
                "is_available": True
            },
            {
                "name": "Camionnette Communautaire",
                "type": "VEHICLE",
                "description": "Ford Transit pour transport de matériel.",
                "capacity": 3,
                "is_available": True
            }
        ]

        self.stdout.write("Seeding resources...")
        for res_data in resources:
            resource, created = Resource.objects.get_or_create(
                name=res_data["name"],
                defaults=res_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created: {resource.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Already exists: {resource.name}"))
        self.stdout.write(self.style.SUCCESS("Done."))
