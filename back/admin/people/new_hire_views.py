from datetime import datetime, timedelta

from django.apps import apps
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.messages.views import SuccessMessageMixin
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic.base import TemplateView, View
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, DeleteView, FormView, UpdateView
from django.views.generic.list import ListView
from django_q.tasks import async_task
from twilio.rest import Client

from admin.admin_tasks.models import AdminTask
from admin.integrations.models import Integration
from admin.notes.models import Note
from admin.sequences.models import Condition, Sequence
from admin.templates.utils import get_templates_model, get_user_field
from organization.models import Notification, Organization, WelcomeMessage
from slack_bot.slack_resource import SlackResource
from slack_bot.slack_to_do import SlackToDo
from slack_bot.tasks import link_slack_users
from slack_bot.utils import Slack, paragraph
from users.emails import (
    email_reopen_task,
    send_new_hire_credentials,
    send_new_hire_preboarding,
    send_reminder_email,
)
from users.mixins import (
    IsAdminOrNewHireManagerMixin,
    LoginRequiredMixin,
    ManagerPermMixin,
)
from users.models import NewHireWelcomeMessage, PreboardingUser, ResourceUser, ToDoUser

from .forms import (
    NewHireAddForm,
    NewHireProfileForm,
    PreboardingSendForm,
    RemindMessageForm,
    SequenceChoiceForm,
)


class NewHireListView(LoginRequiredMixin, ManagerPermMixin, ListView):
    template_name = "new_hires.html"
    paginate_by = 10

    def get_queryset(self):
        all_new_hires = get_user_model().new_hires.all().order_by("-start_day")
        if self.request.user.is_admin:
            return all_new_hires
        return all_new_hires.filter(manager=self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = _("New hires")
        context["subtitle"] = _("people")
        context["add_action"] = reverse_lazy("people:new_hire_add")
        return context


class NewHireAddView(
    LoginRequiredMixin, ManagerPermMixin, SuccessMessageMixin, CreateView
):
    template_name = "new_hire_add.html"
    model = get_user_model()
    form_class = NewHireAddForm
    context_object_name = "object"
    success_message = _("New hire has been created")
    success_url = reverse_lazy("people:new_hires")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = _("Add new hire")
        context["subtitle"] = _("people")
        return context

    def form_valid(self, form):
        sequences = form.cleaned_data.pop("sequences")

        # Set new hire role
        form.instance.role = 0

        new_hire = form.save()

        # Add sequences to new hire
        new_hire.add_sequences(sequences)

        # Send credentials email if the user was created after their start day
        org = Organization.object.get()
        new_hire_datetime = new_hire.get_local_time()
        if (
            new_hire_datetime.date() >= new_hire.start_day
            and new_hire_datetime.hour >= 7
            and new_hire_datetime.weekday() < 5
            and org.new_hire_email
        ):
            async_task("users.tasks.send_new_hire_credentials", new_hire.id)

        # Linking user in Slack and sending welcome message (if exists)
        link_slack_users([new_hire])

        Notification.objects.create(
            notification_type="added_new_hire",
            extra_text=new_hire.full_name,
            created_by=self.request.user,
            created_for=new_hire,
        )

        # Update user amount completed
        new_hire.update_progress()

        # Check if there are items that will not be triggered since date passed
        conditions = Condition.objects.none()
        for seq in sequences:
            if new_hire.workday == 0:
                # User has not started yet, so we only need the items before they new
                # hire started that passed
                conditions |= seq.conditions.filter(
                    condition_type=2, days__lte=new_hire.days_before_starting
                )
            else:
                # user has already started, check both before start day and after for
                # conditions that are not triggered
                conditions |= seq.conditions.filter(
                    condition_type=2
                ) | seq.conditions.filter(condition_type=0, days__lte=new_hire.workday)

        if conditions.count():
            return render(
                self.request,
                "not_triggered_conditions.html",
                {
                    "conditions": conditions,
                    "title": new_hire.full_name,
                    "subtitle": "new hire",
                    "new_hire_id": new_hire.id,
                },
            )

        return super().form_valid(form)


class NewHireSendPreboardingNotificationView(
    LoginRequiredMixin, ManagerPermMixin, IsAdminOrNewHireManagerMixin, FormView
):
    template_name = "trigger_preboarding_notification.html"
    form_class = PreboardingSendForm

    def form_valid(self, form):
        new_hire = get_object_or_404(get_user_model(), id=self.kwargs.get("pk", -1))
        if form.cleaned_data["send_type"] == "email":
            send_new_hire_preboarding(new_hire)
        else:
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            client.messages.create(
                to=new_hire.phone,
                from_=settings.TWILIO_FROM_NUMBER,
                body=new_hire.personalize(
                    WelcomeMessage.objects.get(
                        language=new_hire.language, message_type=2
                    ).message
                ),
            )
        return redirect("people:new_hire", pk=new_hire.id)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user_id = self.kwargs.get("pk", -1)
        new_hire = get_object_or_404(get_user_model(), id=user_id)
        context["title"] = new_hire.full_name
        context["subtitle"] = "new hire"
        return context


class NewHireAddSequenceView(
    LoginRequiredMixin, ManagerPermMixin, IsAdminOrNewHireManagerMixin, FormView
):
    template_name = "new_hire_add_sequence.html"
    form_class = SequenceChoiceForm

    def form_valid(self, form):
        user_id = self.kwargs.get("pk", -1)
        new_hire = get_object_or_404(get_user_model(), id=user_id)
        sequences = Sequence.objects.filter(id__in=form.cleaned_data["sequences"])
        new_hire.add_sequences(sequences)
        messages.success(
            self.request, _("Sequence(s) have been added to this new hire")
        )

        # Check if there are items that will not be triggered since date passed
        conditions = Condition.objects.none()
        for seq in sequences:
            if new_hire.workday == 0:
                # User has not started yet, so we only need the items before they new
                # hire started that passed
                conditions |= seq.conditions.filter(
                    condition_type=2, days__lte=new_hire.days_before_starting
                )
            else:
                # user has already started, check both before start day and after for
                # conditions that are not triggered
                conditions |= seq.conditions.filter(
                    condition_type=2
                ) | seq.conditions.filter(condition_type=0, days__lte=new_hire.workday)

        if conditions.count():
            return render(
                self.request,
                "not_triggered_conditions.html",
                {
                    "conditions": conditions,
                    "title": new_hire.full_name,
                    "subtitle": "new hire",
                    "new_hire_id": new_hire.id,
                },
            )
        return redirect("people:new_hire", pk=new_hire.id)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user_id = self.kwargs.get("pk", -1)
        new_hire = get_object_or_404(get_user_model(), id=user_id)
        context["title"] = new_hire.full_name
        context["subtitle"] = "new hire"
        return context


class NewHireTriggerConditionView(
    LoginRequiredMixin, ManagerPermMixin, IsAdminOrNewHireManagerMixin, TemplateView
):
    template_name = "_trigger_sequence_items.html"

    def post(self, request, pk, condition_pk, *args, **kwargs):
        condition = get_object_or_404(Condition, id=condition_pk)
        new_hire = get_object_or_404(get_user_model(), id=pk)
        condition.process_condition(new_hire)

        # Update user amount completed
        new_hire.update_progress()

        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        condition_id = self.kwargs.get("condition_pk", -1)
        condition = get_object_or_404(Condition, id=condition_id)
        context["completed"] = True
        context["condition"] = condition
        # not relevant, still needed for processing the template
        context["new_hire_id"] = 0
        return context


class NewHireSendLoginEmailView(
    LoginRequiredMixin, ManagerPermMixin, IsAdminOrNewHireManagerMixin, View
):
    def post(self, request, pk, *args, **kwargs):
        new_hire = get_object_or_404(get_user_model(), id=pk)
        send_new_hire_credentials(new_hire.id)
        messages.success(request, _("Sent email to new hire"))
        return redirect("people:new_hire", pk=new_hire.id)


class NewHireSequenceView(
    LoginRequiredMixin, ManagerPermMixin, IsAdminOrNewHireManagerMixin, DetailView
):
    template_name = "new_hire_detail.html"
    model = get_user_model()
    context_object_name = "object"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        new_hire = context["object"]
        context["title"] = new_hire.full_name
        context["subtitle"] = _("new hire")

        # condition items
        conditions_before_first_day = new_hire.conditions.filter(
            condition_type=2, days__lte=new_hire.days_before_starting
        )
        conditions_after_first_day = new_hire.conditions.filter(
            condition_type=0, days__lte=new_hire.days_before_starting
        )
        for condition in conditions_before_first_day:
            condition.days = new_hire.start_day - timedelta(days=condition.days)

        for condition in conditions_after_first_day:
            condition.days = new_hire.workday_to_datetime(condition.days)

        context["conditions_before_first_day"] = conditions_before_first_day
        context["conditions_after_first_day"] = conditions_after_first_day

        context["notifications"] = Notification.objects.filter(created_for=new_hire)
        return context


class NewHireProfileView(
    LoginRequiredMixin, ManagerPermMixin, SuccessMessageMixin, UpdateView
):
    template_name = "new_hire_profile.html"
    model = get_user_model()
    form_class = NewHireProfileForm
    success_message = _("New hire has been updated")
    context_object_name = "object"

    def get_success_url(self):
        return self.request.path

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        new_hire = context["object"]
        context["title"] = new_hire.full_name
        context["subtitle"] = _("new hire")
        return context


class NewHireMigrateToNormalAccountView(LoginRequiredMixin, ManagerPermMixin, View):
    def post(self, request, pk, *args, **kwargs):
        user = get_object_or_404(get_user_model(), id=pk, role=0)
        user.role = 3
        user.save()
        messages.info(request, _("New hire is now a normal account."))
        return redirect("people:new_hires")


class NewHireNotesView(
    LoginRequiredMixin, ManagerPermMixin, SuccessMessageMixin, CreateView
):
    template_name = "new_hire_notes.html"
    model = Note
    fields = [
        "content",
    ]
    success_message = _("Note has been added")

    def get_success_url(self):
        return self.request.path

    def form_valid(self, form):
        new_hire = get_object_or_404(get_user_model(), pk=self.kwargs.get("pk"))
        form.instance.admin = self.request.user
        form.instance.new_hire = new_hire
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        new_hire = get_object_or_404(get_user_model(), pk=self.kwargs.get("pk"))
        context["object"] = new_hire
        context["title"] = new_hire.full_name
        context["subtitle"] = _("new hire")
        context["notes"] = Note.objects.filter(new_hire=new_hire).order_by("-id")
        return context


class NewHireWelcomeMessagesView(LoginRequiredMixin, ManagerPermMixin, ListView):
    template_name = "new_hire_welcome_messages.html"

    def get_queryset(self):
        new_hire = get_object_or_404(get_user_model(), pk=self.kwargs.get("pk"))
        return NewHireWelcomeMessage.objects.filter(new_hire=new_hire).order_by("-id")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        new_hire = get_object_or_404(get_user_model(), pk=self.kwargs.get("pk"))
        context["object"] = new_hire
        context["title"] = new_hire.full_name
        context["subtitle"] = _("new hire")
        return context


class NewHireAdminTasksView(LoginRequiredMixin, ManagerPermMixin, TemplateView):
    template_name = "new_hire_admin_tasks.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        new_hire = get_object_or_404(get_user_model(), pk=self.kwargs.get("pk"))
        context["object"] = new_hire
        context["title"] = new_hire.full_name
        context["subtitle"] = _("new hire")
        context["tasks_completed"] = AdminTask.objects.filter(
            new_hire=new_hire, completed=True
        )
        context["tasks_open"] = AdminTask.objects.filter(
            new_hire=new_hire, completed=False
        )
        return context


class NewHireFormsView(LoginRequiredMixin, ManagerPermMixin, DetailView):
    template_name = "new_hire_forms.html"
    model = get_user_model()
    context_object_name = "object"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        new_hire = self.object
        context["title"] = new_hire.full_name
        context["subtitle"] = _("new hire")
        context["preboarding_forms"] = PreboardingUser.objects.filter(
            user=new_hire, completed=True
        ).exclude(form=[])
        context["todo_forms"] = ToDoUser.objects.filter(
            user=new_hire, completed=True
        ).exclude(form=[])
        return context


class NewHireProgressView(LoginRequiredMixin, ManagerPermMixin, DetailView):
    template_name = "new_hire_progress.html"
    model = get_user_model()
    context_object_name = "object"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        new_hire = self.object
        context["title"] = new_hire.full_name
        context["subtitle"] = _("new hire")
        context["resources"] = ResourceUser.objects.filter(
            user=new_hire, resource__course=True
        )
        context["todos"] = ToDoUser.objects.filter(user=new_hire)
        return context


class NewHireRemindView(LoginRequiredMixin, ManagerPermMixin, View):
    def post(self, request, pk, template_type, *args, **kwargs):
        if template_type not in ["todouser", "resourceuser"]:
            raise Http404

        template_user_model = apps.get_model("users", template_type)

        template_user_obj = template_user_model.objects.get(pk=pk)
        template_user_obj.reminded = datetime.now()
        template_user_obj.save()

        if template_user_obj.user.has_slack_account:
            if template_type == "todouser":
                block = SlackToDo(template_user_obj, template_user_obj.user).get_block()
            else:
                block = SlackResource(
                    template_user_obj, template_user_obj.user
                ).get_block()

            Slack().send_message(
                blocks=[paragraph(_("Don't forget this item!")), block],
                channel=template_user_obj.user.slack_user_id,
            )
        else:
            send_reminder_email(template_user_obj.object_name, template_user_obj.user)

        messages.success(self.request, _("Reminder has been sent!"))

        return redirect("people:new_hire_progress", pk=template_user_obj.user.id)


class NewHireReopenTaskView(LoginRequiredMixin, ManagerPermMixin, FormView):
    template_name = "new_hire_reopen_task.html"
    form_class = RemindMessageForm
    context_object_name = "object"

    def dispatch(self, *args, **kwargs):
        if self.request.user.is_authenticated:
            template_type = self.kwargs.get("template_type", "")
            if template_type not in ["todouser", "resourceuser"]:
                raise Http404

        return super().dispatch(*args, **kwargs)

    def form_valid(self, form):
        pk = self.kwargs.get("pk", -1)
        template_type = self.kwargs.get("template_type", "")

        template_user_model = apps.get_model("users", template_type)

        template_user_obj = template_user_model.objects.get(pk=pk)
        if template_type == "todouser":
            template_user_obj.completed = False
            template_user_obj.form = []
        else:
            template_user_obj.completed_course = False
            template_user_obj.answers.clear()

        template_user_obj.save()

        if template_user_obj.user.has_slack_account:
            if template_type == "todouser":
                block = SlackToDo(template_user_obj, template_user_obj.user).get_block()
            else:
                block = SlackResource(
                    template_user_obj, template_user_obj.user
                ).get_block()

            Slack().send_message(
                blocks=[paragraph(form.cleaned_data["message"]), block],
                text=form.cleaned_data["message"],
                channel=template_user_obj.user.slack_user_id,
            )
        else:
            email_reopen_task(
                template_user_obj.object_name,
                form.cleaned_data["message"],
                template_user_obj.user,
            )

        messages.success(self.request, _("Item has been reopened"))

        # Update user amount completed
        template_user_obj.user.update_progress()

        return redirect("people:new_hire_progress", pk=template_user_obj.user.id)


class NewHireCourseAnswersView(LoginRequiredMixin, ManagerPermMixin, DetailView):
    template_name = "new_hire_course_answers.html"
    model = get_user_model()
    context_object_name = "object"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        new_hire = self.object
        context["title"] = new_hire.full_name
        context["subtitle"] = _("new hire")
        context["resource_user"] = get_object_or_404(
            ResourceUser, user=new_hire, pk=self.kwargs.get("resource_user", -1)
        )
        return context


class NewHireTasksView(LoginRequiredMixin, ManagerPermMixin, DetailView):
    template_name = "new_hire_tasks.html"
    model = get_user_model()
    context_object_name = "object"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = self.object.full_name
        context["subtitle"] = _("new hire")
        return context


class NewHireAccessView(LoginRequiredMixin, ManagerPermMixin, DetailView):
    template_name = "new_hire_access.html"
    model = get_user_model()
    context_object_name = "object"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = self.object.full_name
        context["subtitle"] = _("new hire")
        context["loading"] = True
        context["integrations"] = Integration.objects.account_provision_options()
        return context


class NewHireCheckAccessView(LoginRequiredMixin, ManagerPermMixin, DetailView):
    template_name = "_new_hire_access_card.html"
    model = get_user_model()
    context_object_name = "object"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        integration = get_object_or_404(
            Integration, id=self.kwargs.get("integration_id", -1)
        )
        found_user = integration.user_exists(self.object)
        context["integration"] = integration
        context["active"] = found_user
        return context


class NewHireGiveAccessView(LoginRequiredMixin, ManagerPermMixin, FormView):
    template_name = "give_new_hire_access.html"
    context_object_name = "object"

    def get_form(self):
        integration = get_object_or_404(
            Integration, id=self.kwargs.get("integration_id", -1)
        )
        return integration.config_form()

    def form_valid(self, form):
        integration = get_object_or_404(
            Integration, id=self.kwargs.get("integration_id", -1)
        )
        integration.add_user(self.object.email, form.cleaned_data)

        return redirect("people:new_hire_access", pk=self.object.id)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        integration = get_object_or_404(
            Integration, id=self.kwargs.get("integration_id", -1)
        )
        new_hire = get_object_or_404(get_user_model(), id=self.kwargs.get("pk", -1))
        context["integration"] = integration
        context["title"] = new_hire.full_name
        context["subtitle"] = _("new hire")
        context["new_hire"] = new_hire
        return context


class NewHireTaskListView(LoginRequiredMixin, ManagerPermMixin, DetailView):
    template_name = "new_hire_add_task.html"
    model = get_user_model()
    context_object_name = "object"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        templates_model = get_templates_model(self.kwargs.get("type", ""))
        if templates_model is None:
            raise Http404

        context["title"] = _("Add/Remove templates for %(name)s") % {
            "name": self.object.full_name
        }
        context["subtitle"] = _("new hire")
        context["object_list"] = templates_model.templates.all()
        context["user_items"] = getattr(
            self.object, get_user_field(self.kwargs.get("type", ""))
        )
        return context


class NewHireToggleTaskView(LoginRequiredMixin, ManagerPermMixin, TemplateView):
    template_name = "_toggle_button_new_hire_template.html"
    context_object_name = "object"

    def post(self, request, pk, template_id, type):
        user = get_object_or_404(get_user_model(), id=pk)
        templates_model = get_templates_model(type)

        if templates_model is None:
            raise Http404

        template = get_object_or_404(templates_model, id=template_id, template=True)
        user_items = getattr(user, get_user_field(type))
        if user_items.filter(id=template.id).exists():
            user_items.remove(template)
        else:
            user_items.add(template)

        # Update user amount completed
        user.update_progress()

        context = self.get_context_data(
            **{
                "template": template,
                "user_items": user_items,
                "object": user,
                "id": id,
                "template_type": type,
            }
        )
        return self.render_to_response(context)


class NewHireDeleteView(LoginRequiredMixin, ManagerPermMixin, DeleteView):
    template_name = "new_hire_delete.html"
    queryset = get_user_model().new_hires.all()
    success_url = reverse_lazy("people:new_hires")

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        messages.info(request, _("New hire has been removed"))
        return response