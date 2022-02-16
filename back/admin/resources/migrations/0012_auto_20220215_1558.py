# Generated by Django 3.2.10 on 2022-02-15 15:58

from django.db import migrations

class MigrationResource():
    counter = 0
    model = None

    def __init__(self, _resource, _chapter):
        self.resource_model = _resource
        self.chapter_model = _chapter

    def _recursive_chapters(self, chapter):
        for child in self.chapter_model.objects.filter(parent_chapter__id=chapter.id):
            child.order = self.counter
            child.save()
            self.counter += 1

            self._recursive_chapters(child)

    def update_order(self):
        for resource in self.resource_model.objects.all():
            self.counter = 0
            chapters = resource.chapters.all()

            for chapter in chapters:
                chapter.order = self.counter
                self.counter += 1
                chapter.save()

                if self.chapter_model.objects.filter(parent_chapter__id=chapter.id).count():
                    self._recursive_chapters(chapter)


class Migration(migrations.Migration):

    def update_resource_order(apps, schema_editor):
        Resource = apps.get_model("resources", "Resource")
        Chapter = apps.get_model("resources", "Chapter")
        MigrationResource(Resource, Chapter).update_order()

    dependencies = [
        ('resources', '0011_alter_chapter_options'),
    ]

    operations = [
        migrations.RunPython(update_resource_order),
    ]
