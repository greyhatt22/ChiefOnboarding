# Generated by Django 3.2.13 on 2022-05-17 00:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("integrations", "0015_rename_accesstoken_integration"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="integration",
            name="extra_args",
        ),
    ]